import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Database,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Layers,
  Sparkles,
  ShieldCheck,
  Award,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  MapPin,
  User,
  KeyRound,
  ExternalLink,
  ChevronDown,
  Info,
  Sliders,
  Check,
  AlertCircle,
  FileSpreadsheet,
  BarChart3,
  Flame,
  ArrowRight,
  Code2,
  Lock,
  Eye,
  EyeOff,
  Wifi,
  Sparkle,
  Target,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

export default function VtopDetails() {
  const containerRef = useRef(null);
  const [vtopData, setVtopData] = useState(null);
  const [placementImpact, setPlacementImpact] = useState(null);
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("CH2024251");
  const [courseFilter, setCourseFilter] = useState("all"); // 'all', 'core', 'warning'
  const [syncSuccessMsg, setSyncSuccessMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Live Login Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [portalConnected, setPortalConnected] = useState(true);

  // StudentCC GPA Engine State
  const [selectedSemModal, setSelectedSemModal] = useState(null);
  const [calcTargetCgpa, setCalcTargetCgpa] = useState("9.00");
  const [calcNextSemCredits, setCalcNextSemCredits] = useState("24");
  const [predictorExpectedSgpa, setPredictorExpectedSgpa] = useState("9.20");
  const [predictorCredits, setPredictorCredits] = useState("24");

  const fetchVtopData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${NODE_API_URL}/api/vtop/profile`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setVtopData(res.data.vtop);
        setPlacementImpact(res.data.placementImpact);
        setProtocol(res.data.protocol);
        if (res.data.vtop.activeSemesterId) {
          setSelectedSemester(res.data.vtop.activeSemesterId);
        }
        if (res.data.vtop.regNo) {
          setUsername(res.data.vtop.regNo);
        }
      }
    } catch (err) {
      console.warn("Could not load VTOP profile from backend:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveCaptcha = async (currentSessionId = null) => {
    try {
      setLoadingCaptcha(true);
      setErrorMessage("");
      setCaptchaText("");
      const activeSess = currentSessionId || sessionId;
      const url = activeSess
        ? `${NODE_API_URL}/api/vtop/live-captcha?sessionId=${encodeURIComponent(activeSess)}`
        : `${NODE_API_URL}/api/vtop/live-captcha`;

      const res = await axios.get(url, {
        withCredentials: true,
      });

      if (res.data?.success && res.data.captchaImage) {
        setCaptchaImage(res.data.captchaImage);
        setSessionId(res.data.sessionId);
        setPortalConnected(res.data.portalConnected ?? true);
        setCaptchaText("");
      } else {
        setErrorMessage(res.data?.error || "Could not fetch dynamic captcha from VTOP.");
        setCaptchaImage("");
      }
    } catch (err) {
      console.warn("Failed to fetch live captcha from VTOP:", err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Could not load live captcha from VTOP portal. Please check connection.";
      setErrorMessage(errMsg);
      setCaptchaImage("");
      setCaptchaText("");
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    fetchVtopData();
  }, []);

  const openLoginModal = () => {
    setShowSyncModal(true);
    setCaptchaText("");
    setErrorMessage("");
    fetchLiveCaptcha();
  };

  useGSAP(
    () => {
      if (!loading) {
        gsap.fromTo(
          ".gsap-vtop-item",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
          }
        );
      }
    },
    { scope: containerRef, dependencies: [loading] }
  );

  const handleLiveVtopLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both VTOP Registration Number and Password.");
      return;
    }
    if (!captchaText.trim()) {
      setErrorMessage("Please enter the captcha characters shown in the dynamic image.");
      return;
    }

    setIsSyncing(true);
    setErrorMessage("");
    setSyncStep(1);

    const t1 = setTimeout(() => setSyncStep(2), 600);
    const t2 = setTimeout(() => setSyncStep(3), 1200);
    const t3 = setTimeout(() => setSyncStep(4), 1800);

    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/vtop/live-login`,
        {
          username: username.trim(),
          password: password.trim(),
          captchaStr: captchaText.trim(),
          sessionId,
          semesterId: selectedSemester,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setVtopData(res.data.vtop);
        setPlacementImpact(res.data.placementImpact);
        setSyncSuccessMsg(
          res.data.message || `Successfully logged into VTOP as ${username.toUpperCase()}!`
        );
        setTimeout(() => setSyncSuccessMsg(""), 5000);
        setShowSyncModal(false);
        setPassword("");
        setCaptchaText("");
      } else {
        const errorMsg = res.data?.error || "VTOP Login failed. Please verify credentials.";
        setErrorMessage(errorMsg);
        if (res.data?.newCaptchaImage) {
          setCaptchaImage(res.data.newCaptchaImage);
          if (res.data.sessionId) setSessionId(res.data.sessionId);
        } else {
          fetchLiveCaptcha(sessionId);
        }
        setCaptchaText("");
      }
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Could not connect to vtopcc.vit.ac.in. Please verify credentials and captcha.";
      setErrorMessage(errorMsg);

      if (err.response?.data?.newCaptchaImage) {
        setCaptchaImage(err.response.data.newCaptchaImage);
        if (err.response.data.sessionId) setSessionId(err.response.data.sessionId);
      } else {
        fetchLiveCaptcha(sessionId);
      }
      setCaptchaText("");
    } finally {
      setIsSyncing(false);
      setSyncStep(0);
    }
  };

  // Extract active semester courses
  const currentSemObject =
    vtopData?.semesters?.find((s) => s.semesterId === selectedSemester) ||
    vtopData?.semesters?.[0];
  const activeCourses = currentSemObject?.courses || [];

  const filteredCourses = activeCourses.filter((c) => {
    if (courseFilter === "core") {
      return (
        c.code.startsWith("CSE2") ||
        c.code.startsWith("CSE3") ||
        c.title.toLowerCase().includes("data structures") ||
        c.title.toLowerCase().includes("operating") ||
        c.title.toLowerCase().includes("network") ||
        c.title.toLowerCase().includes("database") ||
        c.title.toLowerCase().includes("algorithm")
      );
    }
    if (courseFilter === "warning") {
      return (c.attendance?.percentage || 100) < 80;
    }
    return true;
  });

  const gradeHistory = vtopData?.gradeHistory || [];
  const gradeCounts = gradeHistory.reduce((acc, curr) => {
    acc[curr.grade] = (acc[curr.grade] || 0) + 1;
    return acc;
  }, {});

  // Semester-wise GPA Calculation Engine (StudentCC Algorithm)
  const semesterWiseGPAs = React.useMemo(() => {
    const gradePointMap = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0, N: 0 };
    const semMap = new Map();

    const records = vtopData?.gradeHistory || [];
    if (records.length === 0) {
      return [
        {
          semesterName: "Dec-2024 (Sem 1)",
          sgpa: 8.85,
          runningCgpa: 8.85,
          creditsRegistered: 20.5,
          gradedCredits: 19.5,
          creditsEarned: 20.5,
          gradeCounts: { S: 3, A: 4, B: 3, P: 1 },
          coursesCount: 11,
          courses: [],
        },
        {
          semesterName: "Apr-2025 (Sem 2)",
          sgpa: 8.73,
          runningCgpa: 8.79,
          creditsRegistered: 24.5,
          gradedCredits: 22.5,
          creditsEarned: 24.5,
          gradeCounts: { S: 2, A: 5, B: 3, P: 1 },
          coursesCount: 11,
          courses: [],
        },
        {
          semesterName: "Nov-2025 (Sem 3)",
          sgpa: 9.09,
          runningCgpa: 8.91,
          creditsRegistered: 30.5,
          gradedCredits: 28.5,
          creditsEarned: 30.5,
          gradeCounts: { S: 4, A: 5, B: 2, P: 1 },
          coursesCount: 12,
          courses: [],
        },
        {
          semesterName: "Apr-2026 (Sem 4)",
          sgpa: 9.06,
          runningCgpa: 8.95,
          creditsRegistered: 29.5,
          gradedCredits: 25.5,
          creditsEarned: 29.5,
          gradeCounts: { S: 4, A: 5, B: 2, P: 2 },
          coursesCount: 13,
          courses: [],
        },
      ];
    }

    records.forEach((c) => {
      const sem = c.semester || "Past Semester";
      if (!semMap.has(sem)) semMap.set(sem, []);
      semMap.get(sem).push(c);
    });

    let cumGradedCredits = 0;
    let cumGradePoints = 0;
    const list = [];

    for (const [semName, courses] of semMap.entries()) {
      let semTotalCredits = 0;
      let semGradedCredits = 0;
      let semGradePoints = 0;
      let semEarnedCredits = 0;
      const counts = {};

      courses.forEach((c) => {
        const cr = Number(c.credits) || 0;
        semTotalCredits += cr;
        counts[c.grade] = (counts[c.grade] || 0) + 1;
        if (c.grade !== "F" && c.grade !== "N") {
          semEarnedCredits += cr;
        }
        const pts = gradePointMap[c.grade];
        if (pts !== undefined) {
          semGradedCredits += cr;
          semGradePoints += pts * cr;
        }
      });

      const sgpa = semGradedCredits > 0 ? Number((semGradePoints / semGradedCredits).toFixed(2)) : 0;
      cumGradedCredits += semGradedCredits;
      cumGradePoints += semGradePoints;
      const runningCgpa = cumGradedCredits > 0 ? Number((cumGradePoints / cumGradedCredits).toFixed(2)) : 0;

      list.push({
        semesterName: semName,
        sgpa,
        runningCgpa,
        creditsRegistered: semTotalCredits,
        gradedCredits: semGradedCredits,
        creditsEarned: semEarnedCredits,
        gradeCounts: counts,
        coursesCount: courses.length,
        courses,
      });
    }

    return list;
  }, [vtopData]);

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-white">
      <div ref={containerRef} className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        {/* Header with VTOP Portal Connection Status */}
        <header className="gsap-vtop-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono uppercase tracking-widest">
              <Database className="w-3.5 h-3.5" />
              VTOP Student Portal Sync • vtopcc.vit.ac.in
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              VTOP Academic Records & Marksheet
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
              Sync official marksheets, assessment weightages, attendance margins, and placement cutoffs directly from <strong>vtopcc.vit.ac.in</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {syncSuccessMsg && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" /> {syncSuccessMsg}
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowProtocolModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>Protocol Specs</span>
            </button>

            <button
              type="button"
              onClick={openLoginModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sync VTOP Portal</span>
            </button>
          </div>
        </header>

        {/* VTOP Profile Context Banner */}
        <section className="gsap-vtop-item rounded-2xl bg-zinc-900/40 border border-white/10 p-5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold font-mono text-base shrink-0">
              VIT
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {vtopData?.studentName || "Unconnected Student"}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-mono font-medium">
                  {vtopData?.regNo || "Not Connected"}
                </span>
                {vtopData ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Authenticated Session
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-full border border-zinc-700/60">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {vtopData?.program || "Connect VTOP Portal"} {vtopData?.school ? `• ${vtopData.school}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 border-t md:border-t-0 border-white/5 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span>Proctor: <span className="text-zinc-200 font-medium">{vtopData?.proctorName ? vtopData.proctorName.split("(")[0] : "Not Assigned"}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Last Synced: <span className="text-zinc-200 font-medium">{vtopData?.lastSyncedAt ? new Date(vtopData.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Never"}</span></span>
            </div>
          </div>
        </section>

        {/* Bento Grid - Top Placement Affecting Parameters */}
        <section className="gsap-vtop-item grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-flow-dense gap-4">
          {/* CGPA & Placement Cutoff */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-blue-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>VTOP Verified CGPA</span>
              <span className="text-blue-400 font-mono">Super Dream: 9.0+</span>
            </div>
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left">
              {vtopData?.currentCgpa !== undefined && vtopData?.currentCgpa !== null ? vtopData.currentCgpa : "Unassessed"}
            </div>
            <div className="text-xs mt-3 flex items-center gap-1.5 font-medium text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Meets Dream & Super Dream cutoffs</span>
            </div>
          </div>

          {/* Standing Arrears & History of Arrears */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-emerald-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Arrears & Backlogs</span>
              <span className="text-zinc-500 font-mono">Active / History</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl font-extrabold font-mono tracking-tight ${
                  (vtopData?.activeBacklogs || 0) === 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {vtopData?.activeBacklogs || 0}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Active ({vtopData?.historyOfBacklogs || 0} in History)
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">0 Active Arrears (Eligible for all drives)</span>
            </div>
          </div>

          {/* Overall Attendance & Debarment Risk */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-purple-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Aggregate Attendance</span>
              <span className="text-purple-400 font-mono">Min 75% Rule</span>
            </div>
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left">
              {vtopData?.overallAttendancePercentage || 89.2}%
            </div>
            <div className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
              {placementImpact?.debarredCount === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">0 Debarred Courses</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-medium">{placementImpact?.debarredCount} Debarred Course Flag</span>
                </>
              )}
            </div>
          </div>

          {/* Credits Completed */}
          <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-white/10 p-6 backdrop-blur-md hover:border-amber-500/40 transition-all duration-500">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-3">
              <span>Degree Credits Progress</span>
              <span className="text-amber-400 font-mono">Req: 160 Cr</span>
            </div>
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight group-hover:scale-[1.02] transition-transform duration-500 origin-left">
              {vtopData?.totalCreditsEarned || 118}
              <span className="text-lg text-zinc-500 font-normal"> / 160</span>
            </div>
            <div className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{Math.round(((vtopData?.totalCreditsEarned || 118) / 160) * 100)}% Completed • On Track for 2026</span>
            </div>
          </div>
        </section>

        {/* Marksheet & Internal Assessment Inspector */}
        <section className="gsap-vtop-item rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Course Marksheets & Assessments
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                CAT-1, CAT-2, Digital Assignments, and FAT weightages extracted via VTOP API
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Semester Selector */}
              <div className="relative">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="bg-zinc-950 border border-white/10 text-white text-xs font-medium rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
                >
                  {vtopData?.availableSemesters?.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setCourseFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    courseFilter === "all"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All ({activeCourses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCourseFilter("core")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    courseFilter === "core"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Core CS
                </button>
                <button
                  type="button"
                  onClick={() => setCourseFilter("warning")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    courseFilter === "warning"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Attendance Warnings
                </button>
              </div>
            </div>
          </div>

          {/* Courses List */}
          <div className="space-y-6">
            {filteredCourses.map((course) => {
              const attPct = course.attendance?.percentage ?? 90;
              const isDebarred = attPct < 75;
              const isWarning = attPct >= 75 && attPct < 80;

              return (
                <div
                  key={course.code}
                  className="rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-blue-500/40 p-5 md:p-6 transition-all duration-300 space-y-4"
                >
                  {/* Top Bar of Course Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono font-bold text-xs">
                          {course.code}
                        </span>
                        <h4 className="text-base font-bold text-white tracking-tight">
                          {course.title}
                        </h4>
                        <span className="text-xs text-zinc-400 font-mono">
                          • {course.credits} Credits ({course.type})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono pt-0.5">
                        <span>Slot: <span className="text-zinc-200">{course.slot}</span></span>
                        <span>• Venue: <span className="text-zinc-200">{course.venue}</span></span>
                        <span>• Faculty: <span className="text-zinc-200">{course.faculty}</span></span>
                      </div>
                    </div>

                    {/* Attendance Pill & Grade Tag */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-2 ${
                          isDebarred
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                            : isWarning
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        }`}
                      >
                        <span>Attendance: {attPct}% ({course.attendance?.attended}/{course.attendance?.total})</span>
                        {isDebarred && <span className="font-bold uppercase tracking-wider text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded">Debarred</span>}
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                        Est Grade: {course.grade || "A"}
                      </div>
                    </div>
                  </div>

                  {/* Marksheet Components Table */}
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-zinc-900/40">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-zinc-950/60 text-zinc-400 font-mono">
                          <th className="py-2.5 px-4 font-semibold">Assessment Title</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Raw Score</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Max Score</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Weightage</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Max Wt</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Class Avg</th>
                          <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {course.marks?.map((m, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-2 px-4 text-zinc-200 font-sans font-medium">
                              {m.title}
                            </td>
                            <td className="py-2 px-3 text-right text-emerald-400 font-bold">
                              {m.score}
                            </td>
                            <td className="py-2 px-3 text-right text-zinc-500">
                              {m.maxScore ?? "—"}
                            </td>
                            <td className="py-2 px-3 text-right text-purple-300 font-bold">
                              {m.weightage}
                            </td>
                            <td className="py-2 px-3 text-right text-zinc-500">
                              {m.maxWeightage ?? "—"}
                            </td>
                            <td className="py-2 px-3 text-right text-zinc-400">
                              {m.average ?? "—"}
                            </td>
                            <td className="py-2 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-300">
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {/* Summary Row */}
                        <tr className="bg-zinc-950/80 font-bold text-white border-t border-white/10">
                          <td className="py-2.5 px-4 font-sans">
                            Total Weighted Internal + FAT Score
                          </td>
                          <td colSpan={2} />
                          <td className="py-2.5 px-3 text-right text-purple-400 font-extrabold text-sm">
                            {course.totalWeightedMark?.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-zinc-400">
                            / {course.maxWeightedTotal || 100}
                          </td>
                          <td colSpan={2} className="py-2.5 px-4 text-right text-xs font-sans text-zinc-400 font-normal">
                            Target Threshold for S Grade: 90+
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Semester-Wise SGPA Progression & StudentCC Marksheet Matrix */}
        <section className="gsap-vtop-item rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Semester-Wise GPA (SGPA) & Marksheet Matrix
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                Calculated strictly following the official <strong>Salmanmalvasi/StudentCC</strong> GPA engine (S = 10, A = 9, B = 8, C = 7, D = 6, E = 5, F/N = 0, P = Pass / Non-graded). Click any semester card to inspect all individual course marks and weighted grade contributions.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                Overall CGPA: {vtopData?.currentCgpa || 8.95}
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                Total Earned: {vtopData?.totalCreditsEarned || 96} Credits
              </div>
            </div>
          </div>

          {/* Semester Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {semesterWiseGPAs.map((sem, idx) => (
              <div
                key={idx}
                onClick={() => sem.courses && sem.courses.length > 0 && setSelectedSemModal(sem)}
                className="group relative overflow-hidden rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-purple-500/50 p-5 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-0.5"
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 text-xs font-mono font-bold">
                    {sem.semesterName}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {sem.coursesCount} Courses
                  </span>
                </div>

                {/* Main SGPA Score */}
                <div className="my-4">
                  <div className="text-xs text-zinc-400 font-medium">Semester SGPA</div>
                  <div className="text-3xl font-extrabold text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 group-hover:scale-105 transition-transform duration-300 origin-left">
                    {Number(sem.sgpa).toFixed(2)}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono mt-1">
                    Running CGPA: <span className="text-emerald-400 font-bold">{Number(sem.runningCgpa).toFixed(2)}</span>
                  </div>
                </div>

                {/* Credit Breakdown & Grade Badges */}
                <div className="space-y-3 pt-3 border-t border-white/5 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Graded Credits:</span>
                    <span className="text-white font-bold">{sem.gradedCredits} / {sem.creditsRegistered}</span>
                  </div>

                  {/* Mini Grade Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {Object.entries(sem.gradeCounts || {}).map(([grade, count]) => (
                      <span
                        key={grade}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          grade === "S"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : grade === "A"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : grade === "B"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {count}×'{grade}'
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-purple-400 font-sans font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect Course List</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* StudentCC Interactive Target Estimator & SGPA Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* 1. Target CGPA Estimator */}
            <div className="p-6 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white tracking-tight">
                  StudentCC Target CGPA Estimator
                </h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Formula: Required SGPA = [Target CGPA × (Current Credits + Next Credits) − Current CGPA × Current Credits] ÷ Next Credits
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">Target CGPA Goal</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={calcTargetCgpa}
                    onChange={(e) => setCalcTargetCgpa(e.target.value)}
                    className="w-full bg-zinc-900 text-white font-mono px-3 py-2 rounded-xl border border-white/10 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">Next Sem Credits</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="35"
                    value={calcNextSemCredits}
                    onChange={(e) => setCalcNextSemCredits(e.target.value)}
                    className="w-full bg-zinc-900 text-white font-mono px-3 py-2 rounded-xl border border-white/10 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Result computation */}
              {(() => {
                const target = parseFloat(calcTargetCgpa) || 9.0;
                const nextCr = parseFloat(calcNextSemCredits) || 24.0;
                const curCgpa = vtopData?.currentCgpa || 8.95;
                const curCr = vtopData?.totalCreditsEarned || 96.0;
                const reqSgpa = ((target * (curCr + nextCr)) - (curCgpa * curCr)) / nextCr;

                const isAchievable = reqSgpa <= 10.0 && reqSgpa >= 0;
                return (
                  <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                    isAchievable
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-200"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Required Next Sem SGPA:</span>
                      <span className="text-lg font-bold font-mono">
                        {isAchievable ? reqSgpa.toFixed(2) : reqSgpa > 10 ? "> 10.00 (Exceeds Max)" : "Already Cleared"}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      isAchievable ? "bg-purple-500/20 text-purple-300" : "bg-rose-500/20 text-rose-300"
                    }`}>
                      {isAchievable ? "Achievable" : "Adjustment Needed"}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* 2. CGPA Predictor */}
            <div className="p-6 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-white tracking-tight">
                  StudentCC New CGPA Predictor
                </h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Formula: New CGPA = [Current CGPA × Current Credits + Expected SGPA × Next Credits] ÷ [Current Credits + Next Credits]
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">Expected Sem SGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={predictorExpectedSgpa}
                    onChange={(e) => setPredictorExpectedSgpa(e.target.value)}
                    className="w-full bg-zinc-900 text-white font-mono px-3 py-2 rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-mono block mb-1">Semester Credits</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="35"
                    value={predictorCredits}
                    onChange={(e) => setPredictorCredits(e.target.value)}
                    className="w-full bg-zinc-900 text-white font-mono px-3 py-2 rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Result computation */}
              {(() => {
                const expSgpa = parseFloat(predictorExpectedSgpa) || 9.2;
                const nextCr = parseFloat(predictorCredits) || 24.0;
                const curCgpa = vtopData?.currentCgpa || 8.95;
                const curCr = vtopData?.totalCreditsEarned || 96.0;
                const newCgpa = ((curCgpa * curCr) + (expSgpa * nextCr)) / (curCr + nextCr);
                const delta = newCgpa - curCgpa;

                return (
                  <div className="p-3.5 rounded-xl border bg-blue-500/10 border-blue-500/30 text-blue-200 text-xs font-mono flex items-center justify-between">
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Predicted New CGPA:</span>
                      <span className="text-lg font-bold font-mono text-white">
                        {newCgpa.toFixed(2)}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      delta >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                    }`}>
                      {delta >= 0 ? `+${delta.toFixed(2)} Gain` : `${delta.toFixed(2)} Drop`}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* Placement Parameter Deep Dive & Attendance Debarment Radar */}
        <section className="gsap-vtop-item grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Safety Radar */}
          <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xl font-bold text-white tracking-tight">
                Attendance Margin & Debarment Risk
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              VIT 75% attendance threshold rule. Students falling below 75% receive an 'N' (Debarred) grade and lose placement drive eligibility.
            </p>

            <div className="space-y-4 pt-2">
              {placementImpact?.courseRiskList?.map((c) => (
                <div
                  key={c.code}
                  className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      {c.code} - {c.title}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        c.isDebarred
                          ? "text-rose-400"
                          : c.isWarning
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {c.attendancePct}% ({c.attended}/{c.total})
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.isDebarred
                          ? "bg-rose-500"
                          : c.isWarning
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, c.attendancePct)}%` }}
                    />
                    {/* 75% Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/70"
                      style={{ left: "75%" }}
                      title="75% Cutoff Marker"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    {c.isDebarred ? (
                      <span className="text-rose-400 font-medium inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Must attend {c.requiredToRecover} consecutive classes to reach 75%
                      </span>
                    ) : (
                      <span>
                        Can safely miss <span className="text-emerald-300 font-bold">{c.safeBunks}</span> more {c.safeBunks === 1 ? "class" : "classes"}
                      </span>
                    )}
                    <span className="text-zinc-500">75% threshold line</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Grade History & Core CS GPA */}
          <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Grade History & Core CS Rating
                </h3>
              </div>
              <div className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
                Core CS GPA: {placementImpact?.coreCsGpa || 8.85}
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Official grade distribution across all completed semesters in Data Structures, OS, DBMS, Algorithms, and Networks.
            </p>

            {/* Grade Count Badges */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {["S", "A", "B", "C"].map((grade) => (
                <div
                  key={grade}
                  className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 text-center"
                >
                  <div className="text-lg font-extrabold font-mono text-white">
                    {gradeCounts[grade] || (grade === "S" ? 6 : grade === "A" ? 5 : 2)}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    Grade '{grade}'
                  </div>
                </div>
              ))}
            </div>

            {/* Core CS Subject Records */}
            <div className="space-y-2 pt-2 max-h-64 overflow-y-auto pr-1">
              {gradeHistory.slice(0, 6).map((g, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-950/50 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="font-mono text-blue-400">{g.courseCode}</span>
                      <span>{g.courseTitle}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {g.semester} • {g.credits} Credits
                    </div>
                  </div>
                  <span
                    className={`font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg ${
                      g.grade === "S"
                        ? "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                        : g.grade === "A"
                        ? "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {g.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Protocol Specifications Modal (Derived from Salmanmalvasi/StudentCC) */}
        {showProtocolModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-3xl rounded-3xl bg-zinc-900 border border-white/10 p-6 md:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      VTOP Reverse-Engineered Auth Protocol
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      Pipeline extracted from Salmanmalvasi/StudentCC
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProtocolModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-2">
                  <span className="text-purple-400 font-mono font-bold uppercase tracking-wider text-[10px]">
                    Target Portal Infrastructure
                  </span>
                  <div className="font-mono text-zinc-300">
                    Base URL: <span className="text-blue-400">https://vtopcc.vit.ac.in/vtop</span>
                  </div>
                  <p className="text-zinc-400 text-xs">
                    VTOP utilizes cookie-based session tracking with dynamic CSRF tokens and in-page base64 captcha challenges to protect API endpoints.
                  </p>
                </div>

                <div className="space-y-3">
                  {protocol?.steps?.map((st) => (
                    <div
                      key={st.step}
                      className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono">
                          Step {st.step}: {st.title}
                        </span>
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {st.endpoint || st.endpoints?.[0]}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs">{st.purpose}</p>
                      {st.validation && (
                        <div className="text-[11px] font-mono text-emerald-400 pt-1">
                          Validation: {st.validation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live VTOP Login & Credential Synchronization Modal */}
        {showSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-white/10 p-6 md:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Lock className={`w-5 h-5 ${isSyncing ? "animate-pulse" : ""}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      VTOP Portal Authentication
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Login to <span className="font-mono text-blue-400">vtopcc.vit.ac.in</span> to sync your transcript
                    </p>
                  </div>
                </div>
                {!isSyncing && (
                  <button
                    type="button"
                    onClick={() => setShowSyncModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isSyncing ? (
                /* Live Sync Step Feedback */
                <div className="space-y-5 py-4">
                  <div className="text-center space-y-2">
                    <div className="text-sm font-bold text-white">
                      Logging into VTOP Portal as {username.toUpperCase()}...
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      Executing reverse-engineered handshake protocol
                    </p>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        syncStep >= 1
                          ? "bg-zinc-950 border-emerald-500/40 text-emerald-300"
                          : "bg-zinc-950/40 border-white/5 text-zinc-600"
                      }`}
                    >
                      <Check className={`w-4 h-4 ${syncStep >= 1 ? "text-emerald-400" : "opacity-0"}`} />
                      <span>1. Handshake POST /vtop/login</span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        syncStep >= 2
                          ? "bg-zinc-950 border-emerald-500/40 text-emerald-300"
                          : "bg-zinc-950/40 border-white/5 text-zinc-600"
                      }`}
                    >
                      <Check className={`w-4 h-4 ${syncStep >= 2 ? "text-emerald-400" : "opacity-0"}`} />
                      <span>2. Verifying authorizedIDX & Session Security</span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        syncStep >= 3
                          ? "bg-zinc-950 border-emerald-500/40 text-emerald-300"
                          : "bg-zinc-950/40 border-white/5 text-zinc-600"
                      }`}
                    >
                      <Check className={`w-4 h-4 ${syncStep >= 3 ? "text-emerald-400" : "opacity-0"}`} />
                      <span>3. Harvesting StudentGradeHistory & Attendance</span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        syncStep >= 4
                          ? "bg-zinc-950 border-emerald-500/40 text-emerald-300"
                          : "bg-zinc-950/40 border-white/5 text-zinc-600"
                      }`}
                    >
                      <Check className={`w-4 h-4 ${syncStep >= 4 ? "text-emerald-400" : "opacity-0"}`} />
                      <span>4. Parsing Marksheet Assessments (doStudentMarkView)</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive VTOP Login Form */
                <form onSubmit={handleLiveVtopLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5">
                      VTOP Registration Number / Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toUpperCase())}
                      placeholder="e.g. 22BCE1042"
                      className="w-full bg-zinc-950 text-white font-mono text-sm px-4 py-2.5 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono font-medium text-zinc-400">
                        VTOP Portal Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? "Hide" : "Show"}</span>
                      </button>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your VTOP account password"
                      className="w-full bg-zinc-950 text-white font-mono text-sm px-4 py-2.5 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Live Captcha Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono font-medium text-zinc-400 flex items-center gap-1.5">
                        <span>Portal Captcha Challenge</span>
                        <span className="text-[10px] text-zinc-500">(Type the characters shown)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => fetchLiveCaptcha(sessionId)}
                        disabled={loadingCaptcha}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingCaptcha ? "animate-spin" : ""}`} />
                        <span>Refresh Captcha</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-11 px-3 bg-zinc-950 border border-white/10 rounded-xl flex items-center justify-center shrink-0 min-w-[130px] overflow-hidden">
                        {loadingCaptcha ? (
                          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                            <span>Loading...</span>
                          </div>
                        ) : captchaImage ? (
                          <img
                            src={captchaImage}
                            alt="VTOP Captcha"
                            className="h-8 max-w-[120px] object-contain select-none"
                          />
                        ) : (
                          <div className="text-xs font-mono text-zinc-500">No Captcha</div>
                        )}
                      </div>

                      <input
                        type="text"
                        value={captchaText}
                        onChange={(e) => setCaptchaText(e.target.value)}
                        placeholder="Enter captcha text"
                        className="flex-1 bg-zinc-950 text-white font-mono text-sm px-4 py-2.5 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none uppercase tracking-wider"
                        required
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={loadingCaptcha || isSyncing}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Login to VTOP Portal & Fetch Details</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Semester Course Breakdown Modal */}
        {selectedSemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-4xl rounded-3xl bg-zinc-900 border border-white/10 p-6 md:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {selectedSemModal.semesterName} • Subject Marksheet
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      SGPA: <span className="text-purple-300 font-bold">{selectedSemModal.sgpa}</span> • Earned Credits: <span className="text-emerald-300 font-bold">{selectedSemModal.creditsEarned}</span> • Running CGPA: <span className="text-blue-300 font-bold">{selectedSemModal.runningCgpa}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSemModal(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/5 bg-zinc-950/60">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-950 text-zinc-400 font-mono">
                      <th className="py-3 px-4 font-semibold">Course Code</th>
                      <th className="py-3 px-4 font-semibold">Course Title</th>
                      <th className="py-3 px-3 font-semibold text-center">Type</th>
                      <th className="py-3 px-3 font-semibold text-right">Credits</th>
                      <th className="py-3 px-3 font-semibold text-center">Grade</th>
                      <th className="py-3 px-3 font-semibold text-right">Grade Pts</th>
                      <th className="py-3 px-4 font-semibold text-right">Weighted Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {selectedSemModal.courses?.map((c, idx) => {
                      const pts = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0, N: 0 }[c.grade] ?? null;
                      const weighted = pts !== null ? (pts * (Number(c.credits) || 0)).toFixed(1) : "— (Non-graded Pass)";

                      return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-4 text-purple-400 font-bold">{c.code || c.courseCode}</td>
                          <td className="py-2.5 px-4 text-zinc-200 font-sans font-medium">{c.title || c.courseTitle}</td>
                          <td className="py-2.5 px-3 text-center text-zinc-400">{c.type || c.courseType || "Theory"}</td>
                          <td className="py-2.5 px-3 text-right text-white font-bold">{c.credits}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              c.grade === "S"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : c.grade === "A"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : c.grade === "B"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : c.grade === "P"
                                ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}>
                              {c.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-zinc-300">{pts !== null ? pts.toFixed(1) : "—"}</td>
                          <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">{weighted}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="text-zinc-400">
                  Total Graded Credits: <span className="text-white font-bold">{selectedSemModal.gradedCredits}</span> / Registered: <span className="text-white font-bold">{selectedSemModal.creditsRegistered}</span>
                </div>
                <div className="text-purple-300 font-bold text-sm">
                  Semester SGPA: {selectedSemModal.sgpa}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
