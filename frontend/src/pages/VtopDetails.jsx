import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  User,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  Award,
  ShieldCheck,
  AlertCircle,
  X,
  KeyRound,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";
import { normalizeCaptchaImageSrc } from "@/utils/captchaImage";
import { getSubjectStudyMaterialUrl } from "@/utils/vtopStudyMaterial";

export default function VtopDetails() {
  // Main Data States
  const [vtopData, setVtopData] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [semesterCourses, setSemesterCourses] = useState([]);

  // Loading States
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSemester, setLoadingSemester] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  // Error & Feedback States
  const [profileError, setProfileError] = useState("");
  const [semesterError, setSemesterError] = useState("");
  const [syncSuccessMsg, setSyncSuccessMsg] = useState("");
  const [modalError, setModalError] = useState("");

  // UI Control States
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"
  const [activeSectionTab, setActiveSectionTab] = useState("all"); // "all" | "subjects" | "attendance" | "grades"
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "theory" | "lab" | "warning"
  const [expandedCourse, setExpandedCourse] = useState(null);

  // Live Login Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1. Fetch Complete VTOP Profile
  const fetchVtopProfile = async () => {
    try {
      setLoadingProfile(true);
      setProfileError("");
      const res = await axios.get(`${NODE_API_URL}/api/vtop/profile`, {
        withCredentials: true,
      });

      if (res.data?.success && res.data.vtop) {
        const vtop = res.data.vtop;
        setVtopData(vtop);

        // Determine active semester
        const initialSem =
          vtop.activeSemesterId ||
          (vtop.availableSemesters?.length > 0 ? vtop.availableSemesters[0].id : "") ||
          (vtop.semesters?.length > 0 ? vtop.semesters[0].semesterId : "");

        if (initialSem) {
          setSelectedSemester(initialSem);
          loadSemesterSubjects(initialSem, vtop);
        }

        if (vtop.regNo) {
          setUsername(vtop.regNo);
        }
      } else {
        setVtopData(null);
      }
    } catch (err) {
      console.warn("Error loading VTOP profile:", err.message);
      setProfileError("VTOP data is currently unavailable. Please check backend connection.");
      setVtopData(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // 2. Load / Filter subjects specifically for the chosen semester
  const loadSemesterSubjects = async (semesterId, currentVtop = null) => {
    if (!semesterId) return;

    setLoadingSemester(true);
    setSemesterError("");
    setSemesterCourses([]); // Clear previous semester subjects immediately to prevent mixing

    try {
      const activeVtop = currentVtop || vtopData;
      const localSem = activeVtop?.semesters?.find(
        (s) => s.semesterId === semesterId || s.semesterName === semesterId
      );

      if (localSem && Array.isArray(localSem.courses) && localSem.courses.length > 0) {
        const enriched = localSem.courses.map((c) => ({
          ...c,
          studyMaterialUrl: c.studyMaterialUrl || getSubjectStudyMaterialUrl(c.code, c.title),
        }));
        setSemesterCourses(enriched);
        setLoadingSemester(false);
        return;
      }

      const res = await axios.get(
        `${NODE_API_URL}/api/vtop/semesters/${encodeURIComponent(semesterId)}`,
        { withCredentials: true }
      );

      if (res.data?.success && Array.isArray(res.data.courses)) {
        const enriched = res.data.courses.map((c) => ({
          ...c,
          studyMaterialUrl: c.studyMaterialUrl || getSubjectStudyMaterialUrl(c.code, c.title),
        }));
        setSemesterCourses(enriched);
      } else {
        setSemesterCourses([]);
      }
    } catch (err) {
      console.warn(`Error loading semester ${semesterId}:`, err.message);
      if (err.response?.status === 404) {
        setSemesterCourses([]);
      } else {
        setSemesterError("Unable to load subjects for this semester.");
      }
    } finally {
      setLoadingSemester(false);
    }
  };

  // 3. Handle Semester Switch
  const handleSemesterChange = (semesterId) => {
    setSelectedSemester(semesterId);
    setExpandedCourse(null);
    loadSemesterSubjects(semesterId);

    axios
      .put(
        `${NODE_API_URL}/api/vtop/active-semester`,
        { semesterId },
        { withCredentials: true }
      )
      .catch(() => {});
  };

  // 4. Fetch Live Captcha
  const fetchLiveCaptcha = async (currentSessionId = null) => {
    try {
      setLoadingCaptcha(true);
      setModalError("");
      setCaptchaText("");
      const activeSess = currentSessionId || sessionId;
      const url = activeSess
        ? `${NODE_API_URL}/api/vtop/live-captcha?sessionId=${encodeURIComponent(activeSess)}`
        : `${NODE_API_URL}/api/vtop/live-captcha`;

      const res = await axios.get(url, { withCredentials: true });

      if (res.data?.success && res.data.captchaImage) {
        setCaptchaImage(res.data.captchaImage);
        setSessionId(res.data.sessionId);
      } else {
        setModalError(res.data?.error || "Could not fetch dynamic captcha from VTOP.");
        setCaptchaImage("");
      }
    } catch (err) {
      setModalError("Could not load live captcha from VTOP portal. Please check connection.");
      setCaptchaImage("");
    } finally {
      setLoadingCaptcha(false);
    }
  };

  const openConnectModal = () => {
    setShowLoginModal(true);
    setCaptchaText("");
    setModalError("");
    fetchLiveCaptcha();
  };

  // 5. Handle Live Login & Full Scrape
  const handleLiveVtopLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setModalError("Please enter both VTOP Registration Number and Password.");
      return;
    }
    if (!captchaText.trim()) {
      setModalError("Please enter the captcha characters shown.");
      return;
    }

    setIsSyncing(true);
    setModalError("");

    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/vtop/live-login`,
        {
          username: username.trim(),
          password: password.trim(),
          captchaStr: captchaText.trim(),
          sessionId,
          semesterId: selectedSemester || undefined,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setVtopData(res.data.vtop);
        setSyncSuccessMsg(
          res.data.message || `Successfully synced VTOP data for ${username.toUpperCase()}!`
        );
        setTimeout(() => setSyncSuccessMsg(""), 6000);
        setShowLoginModal(false);
        setPassword("");
        setCaptchaText("");

        if (res.data.vtop?.activeSemesterId) {
          setSelectedSemester(res.data.vtop.activeSemesterId);
          loadSemesterSubjects(res.data.vtop.activeSemesterId, res.data.vtop);
        }
      } else {
        setModalError(res.data?.error || "VTOP Login failed. Please verify credentials.");
        if (res.data?.newCaptchaImage) {
          setCaptchaImage(res.data.newCaptchaImage);
          if (res.data.sessionId) setSessionId(res.data.sessionId);
        } else {
          fetchLiveCaptcha(sessionId);
        }
        setCaptchaText("");
      }
    } catch (err) {
      setModalError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Could not connect to vtopcc.vit.ac.in. Please verify credentials and captcha."
      );
      if (err.response?.data?.newCaptchaImage) {
        setCaptchaImage(err.response.data.newCaptchaImage);
        if (err.response.data.sessionId) setSessionId(err.response.data.sessionId);
      } else {
        fetchLiveCaptcha(sessionId);
      }
      setCaptchaText("");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchVtopProfile();
  }, []);

  const isConnected = Boolean(vtopData && vtopData.regNo && vtopData.syncStatus === "synced");

  // Filtered Courses for Active Semester
  const filteredCourses = useMemo(() => {
    return semesterCourses.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        c.code?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.faculty?.toLowerCase().includes(q) ||
        c.slot?.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (typeFilter === "theory") return (c.type || "theory").toLowerCase() === "theory";
      if (typeFilter === "lab") return (c.type || "").toLowerCase() === "lab";
      if (typeFilter === "warning") {
        const pct = c.attendance?.percentage;
        return pct !== null && pct !== undefined && pct < 80;
      }
      return true;
    });
  }, [semesterCourses, searchQuery, typeFilter]);

  // Current semester object metadata
  const currentSemesterMeta = useMemo(() => {
    if (!vtopData?.semesters) return null;
    return vtopData.semesters.find(
      (s) => s.semesterId === selectedSemester || s.semesterName === selectedSemester
    );
  }, [vtopData, selectedSemester]);

  // Attendance stats for selected semester
  const semesterAttendanceStats = useMemo(() => {
    let attended = 0;
    let conducted = 0;
    let recordedCourses = 0;
    let safeCount = 0;
    let warningCount = 0;
    let debarredCount = 0;

    semesterCourses.forEach((c) => {
      const att = c.attendance;
      if (att && att.attended !== null && att.total !== null && att.total > 0) {
        attended += att.attended;
        conducted += att.total;
        recordedCourses++;
        const pct = att.percentage !== null ? att.percentage : (att.attended / att.total) * 100;
        if (pct < 75) debarredCount++;
        else if (pct < 80) warningCount++;
        else safeCount++;
      }
    });

    const aggregatePct = conducted > 0 ? Number(((attended / conducted) * 100).toFixed(1)) : null;

    return {
      attended,
      conducted,
      aggregatePct,
      recordedCourses,
      safeCount,
      warningCount,
      debarredCount,
    };
  }, [semesterCourses]);

  // Grade color helper
  const getGradeBadge = (grade) => {
    if (!grade || grade === "Pending" || grade === "In Progress" || grade === "—") {
      return {
        label: grade || "Pending",
        className: "bg-[#F2F0FA] text-[#6F6A80] border-[#E2DEEC]",
      };
    }
    const clean = grade.toUpperCase().trim();
    if (clean === "S") return { label: "S Grade (10)", className: "bg-[#D8FAF4] text-[#0D7A68] border-[#B7F4E8]" };
    if (clean === "A") return { label: "A Grade (9)", className: "bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]" };
    if (clean === "B") return { label: "B Grade (8)", className: "bg-[#EFEAFF] text-[#6E44FF] border-[#DDD3FE]" };
    if (clean === "C") return { label: "C Grade (7)", className: "bg-[#FEF6D6] text-[#9E6700] border-[#FDE68A]" };
    if (clean === "D") return { label: "D Grade (6)", className: "bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]" };
    if (clean === "E") return { label: "E Grade (5)", className: "bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]" };
    if (clean === "F" || clean === "N") return { label: `${clean} (Arrear)`, className: "bg-[#FFE8E5] text-[#C7382B] border-[#FFC5B7]" };
    return { label: clean, className: "bg-[#F2F0FA] text-[#17103D] border-[#E2DEEC]" };
  };

  // Format sync timestamp helper
  const formatSyncTime = (timestamp) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Bar & Connection Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DEEC]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight flex items-center gap-2">
                <span>VTOP Academic Portal</span>
                <ShieldCheck className="w-5 h-5 text-[#0D7A68]" title="Verified VTOPCC Academic Source" />
              </h1>
              <p className="text-xs sm:text-sm text-[#6F6A80]">
                Authoritative synchronization for verified student identity, semester courses, attendance, marks, and VHelp study materials.
              </p>
            </div>
          </div>
        </div>

        {/* Sync Status Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E2DEEC] text-xs font-semibold shadow-sm">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? "bg-[#0D7A68] animate-pulse" : "bg-[#6F6A80]"
              }`}
            />
            <span className="text-[#17103D]">
              {isConnected
                ? `Connected: ${vtopData.regNo} (Synced ${formatSyncTime(vtopData.lastSyncedAt)})`
                : "Not Connected"}
            </span>
          </div>

          <button
            onClick={openConnectModal}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isConnected ? "Sync Now" : "Connect VTOP"}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {syncSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-[#D8FAF4] border border-[#B7F4E8] text-[#0D7A68] text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Profile Error Banner */}
      {profileError && (
        <div className="p-3.5 rounded-xl bg-[#FFE8E5] border border-[#FFC5B7] text-[#C7382B] text-xs font-semibold flex items-center justify-between gap-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
          <button
            onClick={fetchVtopProfile}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#FFC5B7] text-xs font-bold text-[#C7382B] hover:bg-[#FFF4E8] cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Not Connected Prompt */}
      {!isConnected && !loadingProfile && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center mx-auto shadow-inner">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-[#17103D]">
              Connect Your Official VTOP Account
            </h3>
            <p className="text-xs text-[#6F6A80] leading-relaxed">
              Authenticate via VTOPCC to display your verified student profile, semester-wise enrolled subjects, live attendance tracking, and accurate grades.
            </p>
          </div>
          <button
            onClick={openConnectModal}
            className="px-5 py-2.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-[#FFD84D]" />
            <span>Authenticate & Load VTOP Data</span>
          </button>
        </div>
      )}

      {/* 1. STUDENT OVERVIEW SECTION */}
      {loadingProfile ? (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 shadow-sm animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F2F0FA]" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 bg-[#F2F0FA] rounded" />
              <div className="h-3 w-72 bg-[#F2F0FA] rounded" />
            </div>
          </div>
          <div className="text-xs text-[#6F6A80] font-medium pt-2">
            Loading student information from VTOPCC...
          </div>
        </div>
      ) : isConnected && vtopData ? (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2DEEC]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {vtopData.studentName ? vtopData.studentName.charAt(0) : "S"}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-[#17103D]">
                    {vtopData.studentName || vtopData.regNo}
                  </h2>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#EFEAFF] text-[#6E44FF] border border-[#DDD3FE]">
                    {vtopData.regNo}
                  </span>
                  <span className="text-xs text-[#0D7A68] font-semibold flex items-center gap-1 bg-[#D8FAF4] px-2 py-0.5 rounded-md border border-[#B7F4E8]">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified VTOP Profile</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6F6A80] flex-wrap">
                  <span className="font-semibold text-[#17103D]">
                    {vtopData.program || "B.Tech"} {vtopData.branch ? `— ${vtopData.branch}` : ""}
                  </span>
                  {vtopData.school && <span>• {vtopData.school}</span>}
                  {vtopData.campus && <span>• {vtopData.campus}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {vtopData.academicYear && (
                <GpBadge theme="purple" size="sm">
                  AY {vtopData.academicYear}
                </GpBadge>
              )}
              {vtopData.currentSemester && (
                <GpBadge theme="mint" size="sm">
                  {vtopData.currentSemester}
                </GpBadge>
              )}
              {vtopData.proctor?.name && (
                <div className="text-xs px-2.5 py-1 rounded-lg bg-[#F8F8F5] border border-[#E2DEEC] text-[#6F6A80]">
                  <span className="text-[10px] uppercase font-semibold text-[#6F6A80] block">Proctor</span>
                  <span className="font-bold text-[#17103D]">{vtopData.proctor.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1">
              <span className="text-[11px] font-semibold text-[#6F6A80] uppercase tracking-wider block">
                Cumulative CGPA
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#17103D]">
                {vtopData.currentCgpa !== null ? Number(vtopData.currentCgpa).toFixed(2) : "—"}
                <span className="text-xs font-normal text-[#6F6A80] ml-1">/ 10.0</span>
              </div>
              <p className="text-[10px] text-[#0D7A68] font-semibold">
                {Number(vtopData.currentCgpa) >= 9.0 ? "★ Super Dream Tier" : Number(vtopData.currentCgpa) >= 7.5 ? "✓ Dream Tier" : "Regular Tier"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1">
              <span className="text-[11px] font-semibold text-[#6F6A80] uppercase tracking-wider block">
                Overall Attendance
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#17103D]">
                {vtopData.overallAttendancePercentage !== null
                  ? `${vtopData.overallAttendancePercentage}%`
                  : "—"}
              </div>
              <p className="text-[10px] text-[#6F6A80]">
                {vtopData.totalClassesAttended !== null && vtopData.totalClassesConducted !== null
                  ? `${vtopData.totalClassesAttended}/${vtopData.totalClassesConducted} Classes Attended`
                  : "Calculated across semester"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1">
              <span className="text-[11px] font-semibold text-[#6F6A80] uppercase tracking-wider block">
                Credits Completed
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#17103D]">
                {vtopData.totalCreditsEarned ?? "—"}
                <span className="text-xs font-normal text-[#6F6A80] ml-1">
                  / {vtopData.totalCreditsRequired ?? 160}
                </span>
              </div>
              <p className="text-[10px] text-[#6E44FF] font-semibold">
                {vtopData.totalCreditsRequired && vtopData.totalCreditsEarned
                  ? `${Math.round((vtopData.totalCreditsEarned / vtopData.totalCreditsRequired) * 100)}% Degree Progress`
                  : "Required for graduation"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] space-y-1">
              <span className="text-[11px] font-semibold text-[#6F6A80] uppercase tracking-wider block">
                Standing Arrears
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#17103D]">
                {vtopData.activeBacklogs ?? 0}
              </div>
              <p className="text-[10px] font-semibold text-[#0D7A68]">
                {(vtopData.activeBacklogs || 0) === 0 ? "✓ Zero Backlogs Record" : "Backlog Action Required"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* 4. SEMESTER SELECTION SECTION */}
      {isConnected && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2DEEC]">
            <div>
              <h3 className="text-sm font-bold text-[#17103D] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#6E44FF]" />
                <span>Semester Academic Selection</span>
              </h3>
              <p className="text-xs text-[#6F6A80]">
                Choose a semester to isolate and view its specific enrolled subjects, attendance, grades, and study materials.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl self-start md:self-center">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-white text-[#17103D] shadow-sm font-bold"
                    : "text-[#6F6A80] hover:text-[#17103D]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Card Grid</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-[#17103D] shadow-sm font-bold"
                    : "text-[#6F6A80] hover:text-[#17103D]"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Academic Table</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#6F6A80] uppercase tracking-wider">
              Available Semesters (From VTOPCC):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {vtopData?.availableSemesters && vtopData.availableSemesters.length > 0 ? (
                vtopData.availableSemesters.map((sem) => {
                  const isSelected = selectedSemester === sem.id || selectedSemester === sem.name;
                  return (
                    <button
                      key={sem.id}
                      onClick={() => handleSemesterChange(sem.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                        isSelected
                          ? "bg-[#17103D] text-white shadow-md ring-2 ring-[#6E44FF]/40"
                          : "bg-[#F8F8F5] border border-[#E2DEEC] text-[#6F6A80] hover:bg-[#EFEAFF] hover:text-[#6E44FF]"
                      }`}
                    >
                      <span>{sem.name || sem.id}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0D7A68]" />}
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-[#6F6A80] italic">
                  No semester records discovered from VTOP.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#17103D] flex items-center gap-1.5">
                <span>Selected:</span>
                <span className="text-[#6E44FF]">
                  {currentSemesterMeta?.semesterName || selectedSemester || "Current Semester"}
                </span>
              </span>
              <span className="text-[#6F6A80]">•</span>
              <span className="text-[#6F6A80]">
                {semesterCourses.length} Enrolled {semesterCourses.length === 1 ? "Subject" : "Subjects"}
              </span>
              {currentSemesterMeta?.sgpa !== null && currentSemesterMeta?.sgpa !== undefined && (
                <>
                  <span className="text-[#6F6A80]">•</span>
                  <span className="font-bold text-[#0D7A68]">
                    SGPA: {Number(currentSemesterMeta.sgpa).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6F6A80]" />
                <input
                  type="text"
                  placeholder="Search subject or faculty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-[#E2DEEC] rounded-lg text-xs text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-[#E2DEEC] rounded-lg px-2.5 py-1 text-xs text-[#17103D] font-medium focus:outline-none focus:border-[#6E44FF]"
              >
                <option value="all">All Types</option>
                <option value="theory">Theory Only</option>
                <option value="lab">Lab Only</option>
                <option value="warning">Attendance Alert (&lt;80%)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading States for Semester */}
      {loadingSemester && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#6E44FF] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#17103D]">Loading semester records from VTOPCC...</p>
          <p className="text-[11px] text-[#6F6A80]">
            Fetching enrolled subjects, faculty, attendance, and grades for {selectedSemester}...
          </p>
        </div>
      )}

      {/* Error State for Semester */}
      {semesterError && !loadingSemester && (
        <div className="p-4 rounded-xl bg-[#FFE8E5] border border-[#FFC5B7] text-[#C7382B] text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{semesterError}</span>
          </div>
          <button
            onClick={() => loadSemesterSubjects(selectedSemester)}
            className="px-3 py-1 rounded-lg bg-white border border-[#FFC5B7] text-xs font-bold text-[#C7382B] hover:bg-[#FFF4E8] cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loadingSemester && !semesterError && isConnected && semesterCourses.length === 0 && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#F8F8F5] text-[#6F6A80] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#17103D]">
            No Enrolled Subjects Found for {selectedSemester}
          </h4>
          <p className="text-xs text-[#6F6A80] max-w-sm mx-auto">
            No course registrations or marks are recorded for this selected semester in your VTOP records.
          </p>
        </div>
      )}

      {/* Navigation Tabs */}
      {!loadingSemester && isConnected && semesterCourses.length > 0 && (
        <div className="flex items-center gap-2 border-b border-[#E2DEEC] pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveSectionTab("all")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSectionTab === "all"
                ? "bg-[#17103D] text-white shadow-sm font-bold"
                : "text-[#6F6A80] hover:bg-[#F8F8F5]"
            }`}
          >
            All Academic Sections
          </button>
          <button
            onClick={() => setActiveSectionTab("subjects")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSectionTab === "subjects"
                ? "bg-[#17103D] text-white shadow-sm font-bold"
                : "text-[#6F6A80] hover:bg-[#F8F8F5]"
            }`}
          >
            Enrolled Subjects ({filteredCourses.length})
          </button>
          <button
            onClick={() => setActiveSectionTab("attendance")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSectionTab === "attendance"
                ? "bg-[#17103D] text-white shadow-sm font-bold"
                : "text-[#6F6A80] hover:bg-[#F8F8F5]"
            }`}
          >
            Attendance Cards ({semesterAttendanceStats.recordedCourses})
          </button>
          <button
            onClick={() => setActiveSectionTab("grades")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSectionTab === "grades"
                ? "bg-[#17103D] text-white shadow-sm font-bold"
                : "text-[#6F6A80] hover:bg-[#F8F8F5]"
            }`}
          >
            Grades & Performance
          </button>
        </div>
      )}

      {/* 2. DEDICATED ATTENDANCE GRID (INDIVIDUAL CARDS) */}
      {!loadingSemester &&
        isConnected &&
        semesterCourses.length > 0 &&
        (activeSectionTab === "all" || activeSectionTab === "attendance") && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#17103D] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0D7A68]" />
                  <span>Subject Attendance & Safe Bunks</span>
                </h3>
                <p className="text-xs text-[#6F6A80]">
                  Individual subject attendance cards with 75% cutoff threshold calculations.
                </p>
              </div>

              {semesterAttendanceStats.aggregatePct !== null && (
                <div className="flex items-center gap-2 self-start sm:self-center text-xs">
                  <span className="text-[#6F6A80]">Semester Aggregate:</span>
                  <span className="font-mono font-bold text-[#17103D] px-2 py-0.5 rounded-md bg-[#D8FAF4] text-[#0D7A68] border border-[#B7F4E8]">
                    {semesterAttendanceStats.aggregatePct}% ({semesterAttendanceStats.attended}/{semesterAttendanceStats.conducted} classes)
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => {
                const att = course.attendance || {};
                const attPct = att.percentage;
                const attended = att.attended;
                const total = att.total;
                const absent = att.absent !== null && att.absent !== undefined ? att.absent : (total !== null && attended !== null ? total - attended : 0);

                const isDebarred = attPct !== null && attPct < 75;
                const isWarning = attPct !== null && attPct >= 75 && attPct < 80;
                const isSafe = attPct !== null && attPct >= 80;

                const studyUrl = course.studyMaterialUrl || getSubjectStudyMaterialUrl(course.code, course.title);

                return (
                  <div
                    key={`att-${course.code}`}
                    className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                      isDebarred
                        ? "border-[#FFC5B7] ring-1 ring-[#C7382B]/20"
                        : isWarning
                        ? "border-[#FDE68A] ring-1 ring-[#9E6700]/20"
                        : "border-[#E2DEEC]"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-[#EFEAFF] text-[#6E44FF] border border-[#DDD3FE]">
                          {course.code}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            attPct === null || attPct === undefined
                              ? "bg-[#F8F8F5] text-[#6F6A80] border-[#E2DEEC]"
                              : isDebarred
                              ? "bg-[#FFE8E5] text-[#C7382B] border-[#FFC5B7]"
                              : isWarning
                              ? "bg-[#FEF6D6] text-[#9E6700] border-[#FDE68A]"
                              : "bg-[#D8FAF4] text-[#0D7A68] border-[#B7F4E8]"
                          }`}
                        >
                          {attPct === null || attPct === undefined
                            ? "Not Recorded"
                            : isDebarred
                            ? "Debarred Risk (<75%)"
                            : isWarning
                            ? "Warning (75-79%)"
                            : "Safe Attendance"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#17103D] line-clamp-2 leading-snug">
                        {course.title || course.code}
                      </h4>

                      {course.faculty && (
                        <p className="text-[11px] text-[#6F6A80] truncate flex items-center gap-1">
                          <User className="w-3 h-3 shrink-0" />
                          <span>{course.faculty}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-[#17103D]">
                          {attPct !== null && attPct !== undefined ? `${attPct}%` : "—"}
                        </span>
                        <span className="text-xs font-semibold text-[#6F6A80]">
                          {attended !== null && total !== null ? `${attended} / ${total} attended` : "No class logs"}
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-[#F2F0FA] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isDebarred ? "bg-[#C7382B]" : isWarning ? "bg-[#9E6700]" : "bg-[#0D7A68]"
                          }`}
                          style={{ width: `${Math.min(100, attPct || 0)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#F2F0FA]">
                        <div className="space-y-0.5">
                          <span className="text-[#6F6A80] block">Absent:</span>
                          <span className="font-bold text-[#C7382B]">{absent} Classes</span>
                        </div>

                        <div className="space-y-0.5 text-right">
                          {isSafe ? (
                            <>
                              <span className="text-[#6F6A80] block">Safe to miss:</span>
                              <span className="font-bold text-[#0D7A68]">
                                {att.safeBunks !== undefined && att.safeBunks > 0 ? `${att.safeBunks} classes` : "0 classes"}
                              </span>
                            </>
                          ) : isDebarred ? (
                            <>
                              <span className="text-[#C7382B] block">Recovery needed:</span>
                              <span className="font-bold text-[#C7382B]">
                                +{att.requiredToRecover || 1} classes
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[#9E6700] block">Borderline:</span>
                              <span className="font-bold text-[#9E6700]">Do not miss</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Study Material Button */}
                    <div className="pt-2 border-t border-[#E2DEEC] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#6F6A80]">
                        Slot: {course.slot || "—"}
                      </span>
                      <a
                        href={studyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFEAFF] hover:bg-[#E3DCFF] text-[#6E44FF] text-xs font-bold transition-all shadow-sm cursor-pointer"
                        title={`Study material for ${course.title || course.code} on VHelp`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Study Material</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* 3. & 5. ENROLLED SUBJECT CARDS COLUMN */}
      {!loadingSemester &&
        isConnected &&
        semesterCourses.length > 0 &&
        viewMode === "cards" &&
        (activeSectionTab === "all" || activeSectionTab === "subjects") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#17103D] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#6E44FF]" />
                  <span>Enrolled Subject Cards</span>
                </h3>
                <p className="text-xs text-[#6F6A80]">
                  Course specifications, faculty, attendance status, grade results, and direct VHelp study materials.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => {
                const gradeInfo = getGradeBadge(course.grade);
                const attPct = course.attendance?.percentage;
                const studyUrl = course.studyMaterialUrl || getSubjectStudyMaterialUrl(course.code, course.title);
                const isExpanded = expandedCourse === course.code;
                const hasMarks = Array.isArray(course.marks) && course.marks.length > 0;

                return (
                  <div
                    key={`subj-${course.code}`}
                    className="bg-white rounded-2xl p-5 border border-[#E2DEEC] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-[#EFEAFF] text-[#6E44FF] border border-[#DDD3FE]">
                          {course.code}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#F8F8F5] text-[#6F6A80] border border-[#E2DEEC]">
                            {course.type || "Theory"}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FEF6D6] text-[#9E6700] border border-[#FDE68A]">
                            {course.credits ?? 3} Credits
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#17103D] leading-snug break-words">
                        {course.title || course.code}
                      </h4>

                      <div className="space-y-1 text-xs text-[#6F6A80] pt-1">
                        {course.faculty && (
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-[#6E44FF] shrink-0" />
                            <span className="font-medium text-[#17103D]">{course.faculty}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Building className="w-3.5 h-3.5 text-[#6F6A80] shrink-0" />
                          <span>Slot: {course.slot || "—"}</span>
                          {course.venue && <span>• Venue: {course.venue}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-semibold text-[#6F6A80] block">
                          Attendance
                        </span>
                        <span
                          className={`font-bold inline-block ${
                            attPct == null
                              ? "text-[#6F6A80]"
                              : attPct >= 80
                              ? "text-[#0D7A68]"
                              : attPct >= 75
                              ? "text-[#9E6700]"
                              : "text-[#C7382B]"
                          }`}
                        >
                          {attPct != null ? `${attPct}%` : "—"}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <span className="text-[10px] uppercase font-semibold text-[#6F6A80] block">
                          Grade
                        </span>
                        <span
                          className={`inline-block font-bold px-2 py-0.5 rounded-md border text-[11px] ${gradeInfo.className}`}
                        >
                          {gradeInfo.label}
                        </span>
                      </div>
                    </div>

                    {hasMarks && (
                      <div className="space-y-2 border-t border-[#F2F0FA] pt-2">
                        <button
                          onClick={() => setExpandedCourse(isExpanded ? null : course.code)}
                          className="w-full flex items-center justify-between text-xs font-semibold text-[#6E44FF] hover:underline cursor-pointer"
                        >
                          <span>
                            Internal Assessment Breakdown ({course.marks.length} components)
                          </span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="space-y-1.5 pt-1 text-[11px]">
                            {course.marks.map((m, mIdx) => (
                              <div
                                key={mIdx}
                                className="flex items-center justify-between p-2 rounded-lg bg-[#F8F8F5] border border-[#E2DEEC]"
                              >
                                <span className="font-medium text-[#17103D]">{m.title}</span>
                                <span className="font-mono font-bold text-[#6E44FF]">
                                  {m.score ?? "—"} / {m.maxScore ?? 50}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E2DEEC] flex items-center justify-end">
                      <a
                        href={studyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#EFEAFF] hover:bg-[#E3DCFF] text-[#6E44FF] text-xs font-bold transition-all shadow-sm cursor-pointer"
                        title={`Open ${course.title || course.code} study material on vhelpcc.com`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Study Material</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* 6. GRADES COLUMN (ACADEMIC PERFORMANCE) */}
      {!loadingSemester &&
        isConnected &&
        semesterCourses.length > 0 &&
        (activeSectionTab === "all" || activeSectionTab === "grades") && (
          <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DEEC]">
              <div>
                <h3 className="text-base font-bold text-[#17103D] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#FFD84D]" />
                  <span>Grades & Academic Performance</span>
                </h3>
                <p className="text-xs text-[#6F6A80]">
                  Official grades obtained for each enrolled subject in {currentSemesterMeta?.semesterName || selectedSemester}.
                </p>
              </div>

              {currentSemesterMeta?.sgpa !== null && currentSemesterMeta?.sgpa !== undefined && (
                <div className="px-3.5 py-1.5 rounded-xl bg-[#D8FAF4] border border-[#B7F4E8] text-[#0D7A68] text-xs font-bold flex items-center gap-2 self-start sm:self-center">
                  <span>Semester SGPA:</span>
                  <span className="text-base font-black font-mono">
                    {Number(currentSemesterMeta.sgpa).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F8F5] text-[#6F6A80] font-semibold uppercase tracking-wider text-[11px] border-b border-[#E2DEEC]">
                    <th className="py-2.5 px-3">Subject Code</th>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3 text-center">Credits</th>
                    <th className="py-2.5 px-3 text-center">Grade Point</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-right">Study Material</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DEEC]">
                  {filteredCourses.map((course) => {
                    const gradeInfo = getGradeBadge(course.grade);
                    const studyUrl = course.studyMaterialUrl || getSubjectStudyMaterialUrl(course.code, course.title);

                    return (
                      <tr key={`grade-${course.code}`} className="hover:bg-[#F8F8F5]/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#17103D]">
                          {course.code}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#17103D] max-w-[280px]">
                          <div className="truncate">{course.title || course.code}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-[#17103D]">
                          {course.credits ?? 3}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[#6F6A80]">
                          {course.gradePoint !== null && course.gradePoint !== undefined
                            ? course.gradePoint
                            : "—"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block font-bold px-3 py-0.5 rounded-full border text-xs ${gradeInfo.className}`}
                          >
                            {gradeInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={studyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#EFEAFF] hover:bg-[#E3DCFF] text-[#6E44FF] font-semibold text-xs transition-colors"
                          >
                            <span>Study Material</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* 8. ACADEMIC MASTER TABLE (TABLE VIEW) */}
      {!loadingSemester &&
        isConnected &&
        semesterCourses.length > 0 &&
        viewMode === "table" && (
          <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DEEC]">
              <div>
                <h3 className="text-base font-bold text-[#17103D]">
                  Semester Academic Master Table
                </h3>
                <p className="text-xs text-[#6F6A80]">
                  Full transcript for {currentSemesterMeta?.semesterName || selectedSemester}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F8F5] text-[#6F6A80] font-semibold uppercase tracking-wider text-[11px] border-b border-[#E2DEEC]">
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Subject Name</th>
                    <th className="py-3 px-3">Faculty</th>
                    <th className="py-3 px-3 text-center">Type</th>
                    <th className="py-3 px-3 text-center">Credits</th>
                    <th className="py-3 px-3 text-center">Slot / Venue</th>
                    <th className="py-3 px-3 text-center">Attendance</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-right">Study Material</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DEEC]">
                  {filteredCourses.map((course) => {
                    const gradeInfo = getGradeBadge(course.grade);
                    const attPct = course.attendance?.percentage;
                    const studyUrl = course.studyMaterialUrl || getSubjectStudyMaterialUrl(course.code, course.title);

                    return (
                      <tr key={`table-${course.code}`} className="hover:bg-[#F8F8F5]/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#17103D]">
                          {course.code}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#17103D] max-w-[220px]">
                          <div className="truncate">{course.title || course.code}</div>
                        </td>
                        <td className="py-3 px-3 text-[#6F6A80] max-w-[160px] truncate">
                          {course.faculty || "—"}
                        </td>
                        <td className="py-3 px-3 text-center capitalize text-[#6F6A80]">
                          {course.type || "Theory"}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-[#17103D]">
                          {course.credits ?? 3}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[11px] text-[#17103D]">
                          <div>{course.slot || "—"}</div>
                          {course.venue && <div className="text-[10px] text-[#6F6A80]">{course.venue}</div>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              attPct == null
                                ? "text-[#6F6A80] bg-[#F8F8F5]"
                                : attPct >= 80
                                ? "text-[#0D7A68] bg-[#D8FAF4]"
                                : attPct >= 75
                                ? "text-[#9E6700] bg-[#FEF6D6]"
                                : "text-[#C7382B] bg-[#FFE8E5]"
                            }`}
                          >
                            {attPct != null ? `${attPct}%` : "—"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block font-bold px-2 py-0.5 rounded-md border text-[11px] ${gradeInfo.className}`}
                          >
                            {gradeInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={studyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFEAFF] hover:bg-[#E3DCFF] text-[#6E44FF] font-semibold text-xs transition-colors"
                          >
                            <span>Study Material</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* VTOP LIVE LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17103D]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-[#E2DEEC] max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DEEC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17103D]">VTOP Live Portal Login</h3>
                  <p className="text-[11px] text-[#6F6A80]">Authenticate directly with vtopcc.vit.ac.in</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-[#6F6A80] hover:text-[#17103D] p-1 rounded-lg hover:bg-[#F8F8F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-[#FFE8E5] border border-[#FFC5B7] text-[#C7382B] text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleLiveVtopLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#17103D] mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. 22BCE1024"
                  required
                  className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-2 text-sm text-[#17103D] font-mono focus:outline-none focus:border-[#6E44FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#17103D] mb-1">
                  VTOP Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-2 text-sm text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6A80] hover:text-[#17103D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Captcha */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#17103D]">Security Captcha</label>
                  <button
                    type="button"
                    onClick={() => fetchLiveCaptcha(sessionId)}
                    disabled={loadingCaptcha}
                    className="text-[11px] text-[#6E44FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingCaptcha ? "animate-spin" : ""}`} />
                    <span>Refresh Captcha</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-28 bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {captchaImage ? (
                      <img
                        src={normalizeCaptchaImageSrc(captchaImage)}
                        alt="VTOP Captcha"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-[#6F6A80]">Loading...</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={captchaText}
                    onChange={(e) => setCaptchaText(e.target.value)}
                    placeholder="Enter captcha"
                    required
                    className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-2 text-sm font-mono uppercase text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2DEEC] text-xs font-semibold text-[#17103D] hover:bg-[#F8F8F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-5 py-2 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSyncing ? "Authenticating..." : "Login & Sync"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
