import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Layers,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Calendar,
  Clock,
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
  Target,
  X,
  Database,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";

export default function VtopDetails() {
  const containerRef = useRef(null);
  const [vtopData, setVtopData] = useState(null);
  const [placementImpact, setPlacementImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("CH2024251");
  const [courseFilter, setCourseFilter] = useState("all");
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

  const fetchVtopData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${NODE_API_URL}/api/vtop/profile`, {
        withCredentials: true,
      });
      if (res.data?.success && res.data.vtop) {
        setVtopData(res.data.vtop);
        setPlacementImpact(res.data.placementImpact);
        if (res.data.vtop.activeSemesterId) {
          setSelectedSemester(res.data.vtop.activeSemesterId);
        }
        if (res.data.vtop.regNo) {
          setUsername(res.data.vtop.regNo);
        }
      } else {
        setVtopData(null);
        setPlacementImpact(null);
      }
    } catch (err) {
      console.warn("Could not load VTOP profile from backend:", err.message);
      setVtopData(null);
      setPlacementImpact(null);
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
        setCaptchaText("");
      } else {
        setErrorMessage(res.data?.error || "Could not fetch dynamic captcha from VTOP.");
        setCaptchaImage("");
      }
    } catch (err) {
      console.warn("Failed to fetch live captcha from VTOP:", err);
      setErrorMessage("Could not load live captcha from VTOP portal. Please check connection.");
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

  const handleLiveVtopLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both VTOP Registration Number and Password.");
      return;
    }
    if (!captchaText.trim()) {
      setErrorMessage("Please enter the captcha characters shown.");
      return;
    }

    setIsSyncing(true);
    setErrorMessage("");

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
        setErrorMessage(res.data?.error || "VTOP Login failed. Please verify credentials.");
        if (res.data?.newCaptchaImage) {
          setCaptchaImage(res.data.newCaptchaImage);
          if (res.data.sessionId) setSessionId(res.data.sessionId);
        } else {
          fetchLiveCaptcha(sessionId);
        }
        setCaptchaText("");
      }
    } catch (err) {
      setErrorMessage(
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

  const isConnected = Boolean(vtopData && vtopData.regNo);

  // Active semester courses
  const currentSemObject =
    vtopData?.semesters?.find((s) => s.semesterId === selectedSemester) ||
    vtopData?.semesters?.[0];
  const activeCourses = currentSemObject?.courses || [];

  const filteredCourses = activeCourses.filter((c) => {
    if (courseFilter === "core") {
      return (
        c.code?.startsWith("CSE2") ||
        c.code?.startsWith("CSE3") ||
        c.title?.toLowerCase().includes("data structures") ||
        c.title?.toLowerCase().includes("operating") ||
        c.title?.toLowerCase().includes("network") ||
        c.title?.toLowerCase().includes("database") ||
        c.title?.toLowerCase().includes("algorithm")
      );
    }
    if (courseFilter === "warning") {
      return (c.attendance?.percentage || 100) < 75;
    }
    return true;
  });

  const attendanceAlerts = activeCourses.filter(
    (c) => (c.attendance?.percentage || 100) < 75
  );

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
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Top Header & Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2DEEC]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-[#6E44FF]" />
            <span>VTOP Academic Sync</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6A80] mt-1">
            Authoritative VIT Student Portal synchronization for verified CGPA, attendance records, and placement criteria.
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2DEEC] text-xs font-semibold shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-[#0D7A68] animate-pulse" : "bg-[#6F6A80]"
              }`}
            />
            <span className="text-[#17103D]">
              {isConnected
                ? `VTOP Connected (${vtopData.regNo}) • Synced ${formatSyncTime(vtopData.lastSyncedAt)}`
                : "VTOP Not Connected"}
            </span>
          </div>

          <button
            onClick={openLoginModal}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isConnected ? "Sync Now" : "Connect VTOP"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {syncSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-[#D8FAF4] border border-[#B7F4E8] text-[#0D7A68] text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* When VTOP is NOT Connected: Explicit clean connect banner */}
      {!isConnected && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#17103D]">
              Connect Your Official VTOP Account
            </h3>
            <p className="text-xs text-[#6F6A80] leading-relaxed">
              Log in with your university credentials to synchronize authoritative course attendance, grade records, and standing backlogs.
            </p>
          </div>
          <button
            onClick={openLoginModal}
            className="px-5 py-2.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#FFD84D]" />
            <span>Authenticate with VTOP</span>
          </button>
        </div>
      )}

      {/* 4 Primary Metric Cards (When connected) */}
      {isConnected ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: CGPA */}
          <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#6F6A80]">
                Cumulative CGPA
              </span>
              <GpBadge
                theme={Number(vtopData.currentCgpa) >= 8.5 ? "mint" : Number(vtopData.currentCgpa) >= 7.5 ? "yellow" : "coral"}
                size="sm"
              >
                {Number(vtopData.currentCgpa) >= 8.5 ? "Tier-1 Ready" : "Super Dream"}
              </GpBadge>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#17103D]">
              {vtopData.currentCgpa ? Number(vtopData.currentCgpa).toFixed(2) : "N/A"}
            </div>
            <p className="text-[11px] text-[#6F6A80] truncate">
              {vtopData.program || "Academic Program"}
            </p>
          </div>

          {/* Metric 2: Overall Attendance */}
          <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#6F6A80]">
                Overall Attendance
              </span>
              <GpBadge
                theme={(vtopData.overallAttendancePercentage || 0) >= 75 ? "mint" : "coral"}
                size="sm"
              >
                {(vtopData.overallAttendancePercentage || 0) >= 75 ? "Safe" : "Warning"}
              </GpBadge>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#17103D]">
              {vtopData.overallAttendancePercentage != null
                ? `${Number(vtopData.overallAttendancePercentage).toFixed(1)}%`
                : "N/A"}
            </div>
            <p className="text-[11px] text-[#6F6A80]">
              {vtopData.totalClassesAttended ?? 0} of {vtopData.totalClassesConducted ?? 0} classes attended
            </p>
          </div>

          {/* Metric 3: Standing Arrears */}
          <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#6F6A80]">
                Standing Arrears
              </span>
              <GpBadge
                theme={(vtopData.activeBacklogs || 0) === 0 ? "mint" : "coral"}
                size="sm"
              >
                {(vtopData.activeBacklogs || 0) === 0 ? "Clean Record" : "Backlog Alert"}
              </GpBadge>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#17103D]">
              {vtopData.activeBacklogs ?? 0}
            </div>
            <p className="text-[11px] text-[#6F6A80]">
              History of Arrears: {vtopData.historyOfBacklogs ?? 0}
            </p>
          </div>

          {/* Metric 4: Credits Earned */}
          <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#6F6A80]">
                Credits Progress
              </span>
              <span className="text-xs font-mono font-bold text-[#6E44FF]">
                {vtopData.totalCreditsEarned ?? 0} / {vtopData.totalCreditsRequired ?? 160}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#17103D]">
              {vtopData.totalCreditsRequired
                ? Math.round(((vtopData.totalCreditsEarned || 0) / vtopData.totalCreditsRequired) * 100)
                : 0}
              %
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F2F0FA] overflow-hidden">
              <div
                className="h-full bg-[#6E44FF] rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    vtopData.totalCreditsRequired
                      ? ((vtopData.totalCreditsEarned || 0) / vtopData.totalCreditsRequired) * 100
                      : 0
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Attendance Alert if any active course < 75% */}
      {isConnected && attendanceAlerts.length > 0 && (
        <div className="bg-[#FFE8E5] border border-[#FFC5B7] rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C7382B]">
            <AlertTriangle className="w-4 h-4" />
            <span>Attendance Threshold Alert (&lt;75% Cutoff)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attendanceAlerts.map((c) => (
              <div
                key={c.code}
                className="p-3 bg-white rounded-xl border border-[#FFC5B7] text-xs space-y-1"
              >
                <div className="font-bold text-[#17103D] truncate">{c.title || c.code}</div>
                <div className="text-[#C7382B] font-semibold">
                  Current: {c.attendance?.percentage}% (Min 75% needed)
                </div>
                <div className="text-[11px] text-[#6F6A80]">
                  {c.attendance?.attended || 0} / {c.attendance?.total || 0} classes
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Performance Table (When connected) */}
      {isConnected && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DEEC]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#6E44FF]" />
              <h3 className="text-sm font-bold text-[#17103D]">
                Course Performance & Enrolled Subjects
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {vtopData.semesters && vtopData.semesters.length > 0 && (
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-1.5 text-xs text-[#17103D] font-medium focus:outline-none focus:border-[#6E44FF]"
                >
                  {vtopData.semesters.map((s) => (
                    <option key={s.semesterId} value={s.semesterId}>
                      {s.name || s.semesterId}
                    </option>
                  ))}
                </select>
              )}

              <div className="inline-flex items-center p-0.5 bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl text-[11px] font-semibold">
                <button
                  onClick={() => setCourseFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    courseFilter === "all" ? "bg-white text-[#17103D] shadow-sm font-bold" : "text-[#6F6A80]"
                  }`}
                >
                  All ({activeCourses.length})
                </button>
                <button
                  onClick={() => setCourseFilter("core")}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    courseFilter === "core" ? "bg-white text-[#17103D] shadow-sm font-bold" : "text-[#6F6A80]"
                  }`}
                >
                  Core CS
                </button>
                <button
                  onClick={() => setCourseFilter("warning")}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    courseFilter === "warning" ? "bg-white text-[#C7382B] shadow-sm font-bold" : "text-[#6F6A80]"
                  }`}
                >
                  Attendance Watch
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F8F5] text-[#6F6A80] font-semibold uppercase tracking-wider text-[11px] border-b border-[#E2DEEC]">
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Course Title</th>
                  <th className="py-2.5 px-3">Faculty</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3 text-center">Credits</th>
                  <th className="py-2.5 px-3 text-center">Attendance</th>
                  <th className="py-2.5 px-3 text-center">CAT 1</th>
                  <th className="py-2.5 px-3 text-center">CAT 2</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DEEC]">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#6F6A80]">
                      No courses match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c, idx) => {
                    const attPct = c.attendance?.percentage;
                    const attClass =
                      attPct == null
                        ? "text-[#6F6A80] bg-[#F8F8F5]"
                        : attPct >= 85
                        ? "text-[#0D7A68] bg-[#D8FAF4]"
                        : attPct >= 75
                        ? "text-[#9E6700] bg-[#FEF6D6]"
                        : "text-[#C7382B] bg-[#FFE8E5]";

                    return (
                      <tr key={c.code || idx} className="hover:bg-[#F8F8F5]/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#17103D]">
                          {c.code || "—"}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#17103D] max-w-[200px] truncate">
                          {c.title || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-[#6F6A80] max-w-[140px] truncate">
                          {c.faculty || "Not available"}
                        </td>
                        <td className="py-2.5 px-3 text-center text-[11px] text-[#6F6A80]">
                          {c.type || "Theory"}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-[#17103D]">
                          {c.credits ?? 3}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${attClass}`}>
                            {attPct != null ? `${attPct}%` : "—"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[#17103D]">
                          {c.cat1 ?? (c.marks?.cat1 ?? "Not available")}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[#17103D]">
                          {c.cat2 ?? (c.marks?.cat2 ?? "Not available")}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#6E44FF]">
                          {c.grade || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VTOP Live Login Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17103D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 border border-[#E2DEEC] max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DEEC]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#6E44FF]" />
                <h3 className="text-base font-bold text-[#17103D]">VTOP Live Portal Login</h3>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-[#6F6A80] hover:text-[#17103D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#FFE8E5] border border-[#FFC5B7] text-[#C7382B] text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLiveVtopLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#6F6A80] mb-1">
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
                <label className="block font-semibold text-[#6F6A80] mb-1">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6A80]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dynamic Captcha */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#6F6A80]">Security Captcha</label>
                  <button
                    type="button"
                    onClick={() => fetchLiveCaptcha(sessionId)}
                    disabled={loadingCaptcha}
                    className="text-[11px] text-[#6E44FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingCaptcha ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-28 bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {captchaImage ? (
                      <img src={captchaImage} alt="VTOP Captcha" className="h-full w-full object-contain" />
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
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2DEEC] text-xs font-semibold text-[#17103D] hover:bg-[#F2F0FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-5 py-2 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSyncing ? "Authenticating..." : "Login & Sync Data"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
