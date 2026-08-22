import React, { useState, useEffect } from "react";
import {
  Code2,
  ExternalLink,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Target,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Crown,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  Zap,
  BarChart3,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserPlus,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { leetcodeService } from "@/services/leetcodeService";
import LeetCodeSubmissionAnalysis from "./LeetCodeSubmissionAnalysis";
import CaideBadge from "@/components/caide/CaideBadge";
import CaideButton, { CaideArrow } from "@/components/caide/CaideButton";
import CaideCard from "@/components/caide/CaideCard";

export default function LeetCodeConnectCard({ onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [isChangingAccount, setIsChangingAccount] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [activeView, setActiveView] = useState("overview"); // 'overview' | 'submissions'

  const [inputUsername, setInputUsername] = useState("");
  const [changeUsernameInput, setChangeUsernameInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch connected profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await leetcodeService.getProfile();

      if (data?.connected && data?.profile) {
        setProfile(data.profile);
        setConnected(true);
      } else {
        setProfile(null);
        setConnected(false);
      }
    } catch (err) {
      console.error("Error fetching LeetCode profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e, customUsername = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg("");
    setSuccessMsg("");

    const targetInput = (customUsername !== null ? customUsername : inputUsername).trim();
    if (!targetInput) {
      setErrorMsg("Please enter your LeetCode username or profile URL");
      return;
    }

    setConnecting(true);
    try {
      const data = await leetcodeService.connectProfile(targetInput);

      if (data?.profile) {
        setProfile(data.profile);
        setConnected(true);
        setInputUsername("");
        setChangeUsernameInput("");
        setIsChangingAccount(false);
        setSuccessMsg(
          data.message || `Successfully connected @${data.profile.username}!`
        );
        if (onProfileUpdate) onProfileUpdate(data.profile);
      }
    } catch (err) {
      console.error("Error connecting LeetCode account:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to connect LeetCode profile. Please check the username or URL."
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setSyncing(true);

    try {
      const data = await leetcodeService.syncProfile();

      if (data?.profile) {
        setProfile(data.profile);
        setSuccessMsg(data.message || "LeetCode stats refreshed successfully!");
        if (onProfileUpdate) onProfileUpdate(data.profile);
      }
    } catch (err) {
      console.error("Error syncing LeetCode stats:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to refresh LeetCode data. Please verify your connection."
      );
      fetchProfile();
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setDisconnecting(true);

    try {
      await leetcodeService.disconnectProfile();

      setProfile(null);
      setConnected(false);
      setShowConfirmDisconnect(false);
      setIsChangingAccount(false);
      setSuccessMsg("LeetCode profile disconnected successfully");
      if (onProfileUpdate) onProfileUpdate(null);
    } catch (err) {
      console.error("Error disconnecting LeetCode:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to disconnect LeetCode profile."
      );
    } finally {
      setDisconnecting(false);
    }
  };

  const formatFullDateTime = (dateStr) => {
    if (!dateStr) return "Not synced";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Not synced";
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Not synced";
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffSecs < 45) return "just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays === 1) return "yesterday";
      if (diffDays < 30) return `${diffDays} days ago`;
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return "";
    }
  };

  const formatSubmissionTime = (ts) => {
    if (!ts) return "";
    try {
      const num = Number(ts);
      if (!isNaN(num) && num > 0) {
        return formatRelativeTime(new Date(num * 1000));
      }
      return formatRelativeTime(ts);
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 shadow-[6px_6px_0_0_#0D0431] space-y-4">
        <div className="h-6 w-48 bg-[#FEF9CF] rounded-xl animate-pulse border border-[#0D0431]" />
        <div className="h-28 w-full bg-[#FAF7EE] rounded-2xl animate-pulse border border-[#0D0431]" />
      </div>
    );
  }

  // Extract structured and normalized fields safely
  const problemsSolved = profile?.problemsSolved || {
    total: profile?.totalSolved ?? 0,
    easy: profile?.easySolved ?? 0,
    medium: profile?.mediumSolved ?? 0,
    hard: profile?.hardSolved ?? 0,
  };

  const totalSolved = problemsSolved.total ?? profile?.totalSolved ?? 0;
  const easySolved = problemsSolved.easy ?? profile?.easySolved ?? 0;
  const mediumSolved = problemsSolved.medium ?? profile?.mediumSolved ?? 0;
  const hardSolved = problemsSolved.hard ?? profile?.hardSolved ?? 0;

  const totalQuestions = profile?.totalQuestions ?? 0;

  const submissions = profile?.submissions || {};
  const totalSubmissions =
    submissions.total !== undefined && submissions.total !== null
      ? submissions.total
      : null;
  const acceptedSubmissions =
    submissions.accepted !== undefined && submissions.accepted !== null
      ? submissions.accepted
      : null;
  const rejectedSubmissions =
    submissions.rejected !== undefined && submissions.rejected !== null
      ? submissions.rejected
      : null;
  const acceptanceRate =
    submissions.acceptanceRate !== undefined && submissions.acceptanceRate !== null
      ? submissions.acceptanceRate
      : (profile?.acceptanceRate !== undefined && profile?.acceptanceRate !== null
          ? profile.acceptanceRate
          : null);

  const contest = profile?.contest || {};
  const contestRating =
    contest.rating !== undefined && contest.rating !== null ? contest.rating : null;
  const contestGlobalRank =
    contest.globalRank !== undefined && contest.globalRank !== null
      ? contest.globalRank
      : null;
  const contestsAttended =
    contest.contestsAttended !== undefined && contest.contestsAttended !== null
      ? contest.contestsAttended
      : null;
  const contestTopPercentage =
    contest.topPercentage !== undefined && contest.topPercentage !== null
      ? contest.topPercentage
      : null;
  const contestBadge = contest.badge || null;

  const languages = Array.isArray(profile?.languages) ? profile.languages : [];
  const primaryLanguage =
    profile?.primaryLanguage?.name
      ? profile.primaryLanguage
      : languages.length > 0 && languages[0].problemsSolved > 0
      ? { name: languages[0].languageName, solved: languages[0].problemsSolved }
      : null;

  const recentSubmissions = Array.isArray(profile?.recentSubmissions)
    ? profile.recentSubmissions
    : [];

  const topicTags = Array.isArray(profile?.topicTags) ? profile.topicTags : [];

  const easyPct = totalSolved > 0 ? Math.round((easySolved / totalSolved) * 100) : 0;
  const mediumPct = totalSolved > 0 ? Math.round((mediumSolved / totalSolved) * 100) : 0;
  const hardPct =
    totalSolved > 0
      ? Math.max(0, 100 - easyPct - mediumPct)
      : 0;

  const maxLangCount =
    languages.length > 0
      ? Math.max(...languages.map((l) => Number(l.problemsSolved) || 0), 1)
      : 1;

  return (
    <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0_0_#0D0431] space-y-6 text-[#0D0431]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#0D0431] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-xl text-[#0D0431]">LeetCode Analytics</h3>
              {connected && (
                <CaideBadge theme="mint">
                  Connected
                </CaideBadge>
              )}
            </div>
            {!connected && (
              <p className="text-xs text-[#0D0431]/80 mt-0.5 font-medium">
                Connect your public LeetCode profile to import problems, contest rating, and topic analytics.
              </p>
            )}
          </div>
        </div>

        {connected && (
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setIsChangingAccount((prev) => !prev);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              disabled={syncing || disconnecting || connecting}
              className="p-2 rounded-xl border-2 border-[#0D0431] bg-white hover:bg-[#FEF9CF] text-[#0D0431] transition-all shadow-[2px_2px_0_0_#0D0431] text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5"
              title="Connect a different LeetCode account"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#0D0431]" />
              <span className="hidden sm:inline">Change Account</span>
            </button>

            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || disconnecting || connecting}
              className="btn_secondary_wrap px-4 py-2 text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5"
              title="Fetch latest stats from LeetCode"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing..." : "Refresh Data"}</span>
            </button>

            {showConfirmDisconnect ? (
              <div className="flex items-center gap-1.5 bg-[#FFC5B7] border-2 border-[#0D0431] px-3 py-1 rounded-xl shadow-[2px_2px_0_0_#0D0431]">
                <span className="text-xs font-bold text-[#0D0431]">Disconnect?</span>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="text-xs bg-[#0D0431] hover:bg-[#896EE2] text-white font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  {disconnecting ? "..." : "Yes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDisconnect(false)}
                  className="text-xs bg-white hover:bg-zinc-100 text-[#0D0431] font-bold px-2 py-1 rounded-lg border border-[#0D0431] transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDisconnect(true)}
                disabled={syncing || disconnecting || connecting}
                className="p-2 rounded-xl border-2 border-[#0D0431] bg-white hover:bg-[#FFC5B7] text-[#0D0431] transition-all shadow-[2px_2px_0_0_#0D0431] text-xs font-bold font-mono cursor-pointer flex items-center gap-1"
                title="Disconnect LeetCode profile"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Disconnect</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Change Account Inline Modal */}
      {connected && isChangingAccount && (
        <div className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl p-4 sm:p-5 space-y-3 shadow-[3px_3px_0_0_#0D0431]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-[#0D0431]" />
              <span className="text-xs font-heading font-black text-[#0D0431]">
                Switch LeetCode Account
              </span>
            </div>
            <span className="text-[11px] text-[#0D0431]/80 font-mono font-bold">
              Current: @{profile?.username}
            </span>
          </div>

          <form
            onSubmit={(e) => handleConnect(e, changeUsernameInput)}
            className="flex flex-col sm:flex-row gap-2.5 pt-1"
          >
            <input
              type="text"
              value={changeUsernameInput}
              onChange={(e) => setChangeUsernameInput(e.target.value)}
              placeholder="e.g. username or profile URL"
              className="bg-white border-2 border-[#0D0431] text-[#0D0431] placeholder-[#0D0431]/40 rounded-xl px-4 py-2 text-xs font-mono font-bold shadow-[2px_2px_0_0_#0D0431] focus:outline-none flex-1"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={connecting || !changeUsernameInput.trim()}
                className="btn_secondary_wrap px-4 py-2 text-xs font-bold font-mono cursor-pointer"
              >
                {connecting ? "Connecting..." : "Verify & Switch"}
              </button>
              <button
                type="button"
                onClick={() => setIsChangingAccount(false)}
                className="px-3 py-2 text-xs font-mono font-bold text-[#0D0431] hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts & Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-[#D4FDF7] border-2 border-[#0D0431] text-[#0D0431] px-4 py-3 rounded-2xl text-xs font-bold font-mono shadow-[3px_3px_0_0_#0D0431]">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 bg-[#FFC5B7] border-2 border-[#0D0431] text-[#0D0431] px-4 py-3 rounded-2xl text-xs font-bold font-mono shadow-[3px_3px_0_0_#0D0431]">
          <AlertCircle className="w-4 h-4 text-[#0D0431] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Graceful sync failure alert */}
      {profile?.syncStatus === "failed" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FEF9CF] border-2 border-[#0D0431] p-4 rounded-2xl text-xs font-mono font-bold shadow-[3px_3px_0_0_#0D0431]">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#0D0431] shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span>Unable to refresh live stats from LeetCode. Showing cached submission snapshot.</span>
              {profile.syncError && (
                <div className="text-[11px] text-[#0D0431]/70 font-normal mt-0.5">
                  Reason: {profile.syncError}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="btn_secondary_wrap px-3 py-1.5 text-xs font-bold font-mono shrink-0 self-start sm:self-auto cursor-pointer"
          >
            {syncing ? "Retrying..." : "Retry Sync"}
          </button>
        </div>
      )}

      {/* CONNECTED STATE DASHBOARD */}
      {connected && profile ? (
        <div className="space-y-6">
          {/* 1. LeetCode Profile Summary Banner */}
          <div className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[4px_4px_0_0_#0D0431]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FEDF6A] border-2 border-[#0D0431] flex items-center justify-center text-[#0D0431] font-heading font-black text-2xl font-mono shrink-0 shadow-[2px_2px_0_0_#0D0431]">
                {profile.username?.charAt(0)?.toUpperCase() || "L"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-heading font-black text-lg sm:text-xl text-[#0D0431]">
                    {profile.realName || profile.username}
                  </h3>
                  <a
                    href={profile.profileUrl || `https://leetcode.com/u/${profile.username}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#0D0431] font-mono font-bold bg-white px-3 py-0.5 rounded-full border border-[#0D0431] shadow-[1px_1px_0_0_#0D0431] hover:bg-[#FEDF6A] transition-colors"
                    title="Open LeetCode profile in new tab"
                  >
                    <span>@{profile.username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#0D0431]/80 mt-1.5 font-mono font-bold">
                  {profile.ranking && profile.ranking < 5000000 ? (
                    <span className="flex items-center gap-1 text-[#0D0431]">
                      <Trophy className="w-3.5 h-3.5 text-[#0D0431]" />
                      Rank #{profile.ranking.toLocaleString()}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#0D0431]/60">
                      <Trophy className="w-3.5 h-3.5" />
                      Unranked
                    </span>
                  )}

                  {contestRating !== null && (
                    <span className="flex items-center gap-1 text-[#0D0431]">
                      <Award className="w-3.5 h-3.5 text-[#0D0431]" />
                      Rating: {contestRating.toLocaleString()}
                    </span>
                  )}

                  {profile.lastSyncedAt && (
                    <span
                      className="flex items-center gap-1 text-[#0D0431]/70"
                      title={formatFullDateTime(profile.lastSyncedAt)}
                    >
                      <Clock className="w-3 h-3" />
                      Last synced: {formatRelativeTime(profile.lastSyncedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Total Solved Overview Badge */}
            <div className="flex items-center gap-4 bg-white border-2 border-[#0D0431] px-5 py-3 rounded-2xl shadow-[3px_3px_0_0_#0D0431] shrink-0 self-start md:self-auto">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-mono font-bold text-[#0D0431]/70">
                  Total Solved
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-heading font-black text-[#0D0431]">
                    {totalSolved}
                  </span>
                  {totalQuestions > 0 && (
                    <span className="text-xs font-mono font-bold text-[#0D0431]/60">
                      / {totalQuestions}
                    </span>
                  )}
                </div>
              </div>
              {acceptanceRate !== null && (
                <div className="pl-4 border-l-2 border-[#0D0431]/20 space-y-0.5">
                  <div className="text-[10px] uppercase font-mono font-bold text-[#0D0431]/70">
                    Accuracy
                  </div>
                  <div className="text-lg font-heading font-black text-[#0D0431]">
                    {acceptanceRate}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sub-view switcher tabs */}
          <div className="flex items-center gap-2.5 border-b-2 border-[#0D0431] pb-3">
            <button
              type="button"
              onClick={() => setActiveView("overview")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono border-2 border-[#0D0431] transition-all cursor-pointer ${
                activeView === "overview"
                  ? "bg-[#FEDF6A] text-[#0D0431] shadow-[3px_3px_0_0_#0D0431]"
                  : "bg-white text-[#0D0431] hover:bg-[#FEF9CF] shadow-[2px_2px_0_0_#0D0431]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#0D0431]" />
              <span>Overview & Topic Strengths</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("submissions")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono border-2 border-[#0D0431] transition-all cursor-pointer ${
                activeView === "submissions"
                  ? "bg-[#FEDF6A] text-[#0D0431] shadow-[3px_3px_0_0_#0D0431]"
                  : "bg-white text-[#0D0431] hover:bg-[#FEF9CF] shadow-[2px_2px_0_0_#0D0431]"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#0D0431]" />
              <span>Submission Activity & Consistency</span>
            </button>
          </div>

          {activeView === "submissions" ? (
            <LeetCodeSubmissionAnalysis showHeader={false} />
          ) : (
            <>
              {/* 2. Difficulty Distribution Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#0D0431]" />
                    <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                      Difficulty Distribution
                    </h4>
                  </div>
                  <span className="text-xs text-[#0D0431]/80 font-mono font-bold">
                    {totalSolved} problem{totalSolved === 1 ? "" : "s"} resolved
                  </span>
                </div>

                {/* Combined Multi-segment Bar */}
                {totalSolved > 0 && (
                  <div className="w-full h-3.5 bg-white rounded-full overflow-hidden flex border-2 border-[#0D0431]">
                    <div
                      style={{ width: `${easyPct}%` }}
                      className="bg-[#D4FDF7] transition-all duration-500 border-r border-[#0D0431]"
                      title={`Easy: ${easySolved} (${easyPct}%)`}
                    />
                    <div
                      style={{ width: `${mediumPct}%` }}
                      className="bg-[#FEDF6A] transition-all duration-500 border-r border-[#0D0431]"
                      title={`Medium: ${mediumSolved} (${mediumPct}%)`}
                    />
                    <div
                      style={{ width: `${hardPct}%` }}
                      className="bg-[#FFC5B7] transition-all duration-500"
                      title={`Hard: ${hardSolved} (${hardPct}%)`}
                    />
                  </div>
                )}

                {/* Individual Difficulty Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Easy Card */}
                  <div className="bg-[#D4FDF7] border-2 border-[#0D0431] rounded-2xl p-5 space-y-3 shadow-[4px_4px_0_0_#0D0431]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-[#0D0431]" />
                        Easy
                      </span>
                      <span className="text-sm font-mono font-black text-[#0D0431]">
                        {easySolved} Solved
                      </span>
                    </div>

                    <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#0D0431]">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            totalSolved > 0 ? (easySolved / totalSolved) * 100 : 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#0D0431] font-mono font-bold">
                      <span>Share of Solved</span>
                      <span>{easyPct}%</span>
                    </div>
                  </div>

                  {/* Medium Card */}
                  <div className="bg-[#FEDF6A] border-2 border-[#0D0431] rounded-2xl p-5 space-y-3 shadow-[4px_4px_0_0_#0D0431]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600 border border-[#0D0431]" />
                        Medium
                      </span>
                      <span className="text-sm font-mono font-black text-[#0D0431]">
                        {mediumSolved} Solved
                      </span>
                    </div>

                    <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#0D0431]">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            totalSolved > 0 ? (mediumSolved / totalSolved) * 100 : 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#0D0431] font-mono font-bold">
                      <span>Share of Solved</span>
                      <span>{mediumPct}%</span>
                    </div>
                  </div>

                  {/* Hard Card */}
                  <div className="bg-[#FFC5B7] border-2 border-[#0D0431] rounded-2xl p-5 space-y-3 shadow-[4px_4px_0_0_#0D0431]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-[#0D0431]" />
                        Hard
                      </span>
                      <span className="text-sm font-mono font-black text-[#0D0431]">
                        {hardSolved} Solved
                      </span>
                    </div>

                    <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#0D0431]">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            totalSolved > 0 ? (hardSolved / totalSolved) * 100 : 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#0D0431] font-mono font-bold">
                      <span>Share of Solved</span>
                      <span>{hardPct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Middle Section: Submission Activity & Contest & Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Submission Activity Card */}
                <div className="bg-[#FAF7EE] border-2 border-[#0D0431] rounded-2xl p-5 space-y-4 shadow-[3px_3px_0_0_#0D0431]">
                  <div className="flex items-center justify-between border-b border-[#0D0431]/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#0D0431]" />
                      <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                        Submission Activity
                      </h4>
                    </div>
                    {acceptanceRate !== null && (
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E4CDFB] border border-[#0D0431]">
                        {acceptanceRate}% Success Rate
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-white border-2 border-[#0D0431] p-3 rounded-xl space-y-0.5 shadow-[1px_1px_0_0_#0D0431]">
                      <div className="text-[10px] text-[#0D0431]/70 font-mono font-bold uppercase">Total Submissions</div>
                      <div className="text-base font-heading font-black text-[#0D0431]">
                        {totalSubmissions !== null ? totalSubmissions.toLocaleString() : "N/A"}
                      </div>
                    </div>

                    <div className="bg-white border-2 border-[#0D0431] p-3 rounded-xl space-y-0.5 shadow-[1px_1px_0_0_#0D0431]">
                      <div className="text-[10px] text-[#0D0431]/70 font-mono font-bold uppercase">Accepted</div>
                      <div className="text-base font-heading font-black text-emerald-700">
                        {acceptedSubmissions !== null ? acceptedSubmissions.toLocaleString() : "N/A"}
                      </div>
                    </div>

                    <div className="bg-white border-2 border-[#0D0431] p-3 rounded-xl space-y-0.5 col-span-2 sm:col-span-1 shadow-[1px_1px_0_0_#0D0431]">
                      <div className="text-[10px] text-[#0D0431]/70 font-mono font-bold uppercase">Rejected / Other</div>
                      <div className="text-base font-heading font-black text-[#F85B52]">
                        {rejectedSubmissions !== null ? rejectedSubmissions.toLocaleString() : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contest & Rating Card */}
                <div className="bg-[#FAF7EE] border-2 border-[#0D0431] rounded-2xl p-5 space-y-4 shadow-[3px_3px_0_0_#0D0431]">
                  <div className="flex items-center justify-between border-b border-[#0D0431]/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#0D0431]" />
                      <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                        Contest & Rating
                      </h4>
                    </div>
                    {contestBadge ? (
                      <CaideBadge theme="yellow">
                        <Crown className="w-3 h-3 mr-1" />
                        {contestBadge}
                      </CaideBadge>
                    ) : contestRating !== null ? (
                      <CaideBadge theme="mint">Active Competitor</CaideBadge>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-white border-2 border-[#0D0431] p-3 rounded-xl space-y-0.5 shadow-[1px_1px_0_0_#0D0431]">
                      <div className="text-[10px] text-[#0D0431]/70 font-mono font-bold uppercase">Contest Rating</div>
                      <div className="text-base font-heading font-black text-[#0D0431]">
                        {contestRating !== null ? contestRating.toLocaleString() : "N/A"}
                      </div>
                    </div>

                    <div className="bg-white border-2 border-[#0D0431] p-3 rounded-xl space-y-0.5 shadow-[1px_1px_0_0_#0D0431]">
                      <div className="text-[10px] text-[#0D0431]/70 font-mono font-bold uppercase">Global Rank</div>
                      <div className="text-base font-heading font-black text-[#0D0431]">
                        {contestGlobalRank !== null ? `#${contestGlobalRank.toLocaleString()}` : "N/A"}
                      </div>
                    </div>

                    <div className="bg-white border-2 border-[#0D0431] p-3 rounded-xl space-y-0.5 col-span-2 sm:col-span-1 shadow-[1px_1px_0_0_#0D0431]">
                      <div className="text-[10px] text-[#0D0431]/70 font-mono font-bold uppercase">Attended</div>
                      <div className="text-base font-heading font-black text-[#0D0431]">
                        {contestsAttended !== null ? `${contestsAttended} contests` : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Programming Languages Card */}
              <div className="bg-white border-2 border-[#0D0431] rounded-2xl p-5 space-y-4 shadow-[4px_4px_0_0_#0D0431]">
                <div className="flex items-center justify-between border-b border-[#0D0431]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#0D0431]" />
                    <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                      Programming Languages
                    </h4>
                  </div>
                  {primaryLanguage && (
                    <span className="text-xs font-mono font-bold bg-[#FEF9CF] px-3 py-1 rounded-full border border-[#0D0431]">
                      Primary: <strong>{primaryLanguage.name}</strong> ({primaryLanguage.solved} solved)
                    </span>
                  )}
                </div>

                {languages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {languages.map((lang, idx) => {
                      const isPrimary = primaryLanguage && lang.languageName === primaryLanguage.name;
                      const pct = totalSolved > 0
                        ? Math.round((lang.problemsSolved / totalSolved) * 100)
                        : Math.round((lang.problemsSolved / maxLangCount) * 100);

                      return (
                        <div
                          key={lang.languageName || idx}
                          className={`p-3.5 rounded-xl border-2 border-[#0D0431] transition-all ${
                            isPrimary
                              ? "bg-[#FEDF6A] shadow-[3px_3px_0_0_#0D0431]"
                              : "bg-[#FAF7EE] shadow-[2px_2px_0_0_#0D0431]"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                            <span className="text-[#0D0431] flex items-center gap-1.5 font-heading">
                              {isPrimary && <Star className="w-3 h-3 text-[#0D0431] fill-[#0D0431]" />}
                              {lang.languageName}
                            </span>
                            <span className="font-mono">
                              {lang.problemsSolved} solved
                            </span>
                          </div>
                          <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#0D0431]">
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-[#896EE2]"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(8, (lang.problemsSolved / maxLangCount) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-end text-[10px] text-[#0D0431]/70 font-mono font-bold mt-1">
                            <span>{pct}% of profile</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-[#0D0431]/70 font-mono py-4 text-center bg-[#FAF7EE] rounded-xl border border-[#0D0431]">
                    No language data available.
                  </div>
                )}
              </div>

              {/* 5. Topic Strengths Section */}
              {topicTags.length > 0 && (
                <div className="bg-white border-2 border-[#0D0431] rounded-2xl p-5 space-y-3 shadow-[4px_4px_0_0_#0D0431]">
                  <div className="flex items-center justify-between border-b border-[#0D0431]/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#0D0431]" />
                      <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                        Topic Strengths ({topicTags.length})
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(showAllTopics ? topicTags : topicTags.slice(0, 16)).map((tag, idx) => (
                      <div
                        key={tag.tagSlug || idx}
                        className="inline-flex items-center gap-2 bg-[#FEF9CF] hover:bg-[#FEDF6A] border-2 border-[#0D0431] px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-[2px_2px_0_0_#0D0431] transition-all"
                      >
                        <span className="text-[#0D0431]">{tag.tagName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white border border-[#0D0431]">
                          {tag.problemsSolved}
                        </span>
                      </div>
                    ))}
                  </div>

                  {topicTags.length > 16 && (
                    <div className="pt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowAllTopics((prev) => !prev)}
                        className="text-xs text-[#0D0431] font-mono font-bold underline flex items-center gap-1 cursor-pointer"
                      >
                        {showAllTopics ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Show Less Topics</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Show All {topicTags.length} Topics</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 6. Recent Submissions Section */}
              <div className="bg-white border-2 border-[#0D0431] rounded-2xl p-5 space-y-3 shadow-[4px_4px_0_0_#0D0431]">
                <div className="flex items-center justify-between border-b border-[#0D0431]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0D0431]" />
                    <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                      Recent Submissions
                    </h4>
                  </div>
                </div>

                {recentSubmissions.length > 0 ? (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {recentSubmissions.map((sub, idx) => {
                      const isAccepted = sub.statusDisplay === "Accepted";
                      const isWrong = sub.statusDisplay === "Wrong Answer";
                      const isTLE = sub.statusDisplay === "Time Limit Exceeded";

                      return (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-2.5 px-4 rounded-xl bg-[#FAF7EE] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isAccepted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[#F85B52] shrink-0" />
                            )}
                            <div className="min-w-0">
                              {sub.titleSlug ? (
                                <a
                                  href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0D0431] font-bold font-heading truncate inline-flex items-center gap-1 hover:underline"
                                >
                                  <span>{sub.title || sub.titleSlug}</span>
                                  <ExternalLink className="w-2.5 h-2.5 text-[#0D0431]/60 shrink-0" />
                                </a>
                              ) : (
                                <div className="text-[#0D0431] font-bold truncate">
                                  {sub.title || "Submission"}
                                </div>
                              )}
                              <div className="text-[10px] text-[#0D0431]/70 font-mono font-bold flex items-center gap-2 mt-0.5">
                                {sub.lang && (
                                  <span className="px-1.5 py-0.2 rounded bg-white border border-[#0D0431]">
                                    {sub.lang}
                                  </span>
                                )}
                                {sub.timestamp && (
                                  <span>· {formatSubmissionTime(sub.timestamp)}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="self-end sm:self-auto shrink-0">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-black border ${
                                isAccepted
                                  ? "bg-[#D4FDF7] text-[#0D0431] border-[#0D0431]"
                                  : isWrong
                                  ? "bg-[#FFC5B7] text-[#0D0431] border-[#0D0431]"
                                  : isTLE
                                  ? "bg-[#FEDF6A] text-[#0D0431] border-[#0D0431]"
                                  : "bg-white text-[#0D0431] border-[#0D0431]"
                              }`}
                            >
                              {sub.statusDisplay || "Submitted"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-[#0D0431]/70 font-mono py-6 text-center bg-[#FAF7EE] rounded-xl border border-[#0D0431]">
                    No recent submissions recorded on public endpoint.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        /* DISCONNECTED STATE */
        <div className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl p-6 space-y-4 shadow-[4px_4px_0_0_#0D0431]">
          <div className="space-y-1">
            <h4 className="font-heading font-black text-base text-[#0D0431]">
              Connect your LeetCode profile
            </h4>
            <p className="text-xs text-[#0D0431]/80 leading-relaxed font-medium">
              Enter your public LeetCode username or profile link below. We query LeetCode’s public GraphQL endpoints to import your verified problem counts, difficulty breakdown, submission activity, contest ranking, and programming languages.
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder="Enter LeetCode username (e.g. tourist) or profile URL"
                  className="w-full bg-white text-[#0D0431] placeholder-[#0D0431]/40 border-2 border-[#0D0431] rounded-xl px-4 py-2.5 text-xs font-mono font-bold shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                  disabled={connecting}
                />
              </div>

              <CaideButton
                type="submit"
                disabled={connecting || !inputUsername.trim()}
                variant="stacked-yellow"
                size="md"
              >
                {connecting ? "Connecting..." : "Connect LeetCode"}
              </CaideButton>
            </div>

            {connecting && (
              <div className="text-[11px] font-mono font-bold text-[#0D0431] flex items-center gap-2 bg-white border-2 border-[#0D0431] px-3 py-2 rounded-xl shadow-[2px_2px_0_0_#0D0431]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#896EE2] shrink-0" />
                <span>Querying LeetCode public GraphQL: Verifying profile, solved counts, accuracy, and topic breakdown...</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono font-bold text-[#0D0431] pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Public stats only
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                No password required
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#896EE2]" />
                Auto-updates readiness score
              </span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
