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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { leetcodeService } from "@/services/leetcodeService";
import LeetCodeSubmissionAnalysis from "./LeetCodeSubmissionAnalysis";

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
      // Non-blocking error
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e, customUsername = null) => {
    if (e) e.preventDefault();
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
      // Re-fetch profile to capture syncStatus='failed' state
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
        // Unix timestamp in seconds
        return formatRelativeTime(new Date(num * 1000));
      }
      return formatRelativeTime(ts);
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#141414] border-gray-800/80">
        <CardHeader className="pb-4 border-b border-gray-800/60">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded bg-gray-800" />
            <Skeleton className="h-5 w-48 bg-gray-800" />
          </div>
          <Skeleton className="h-4 w-72 bg-gray-800/60 mt-1" />
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-28 w-full bg-gray-800/40 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 bg-gray-800/30 rounded-lg" />
            <Skeleton className="h-24 bg-gray-800/30 rounded-lg" />
            <Skeleton className="h-24 bg-gray-800/30 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 bg-gray-800/30 rounded-lg" />
            <Skeleton className="h-48 bg-gray-800/30 rounded-lg" />
          </div>
        </CardContent>
      </Card>
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

  // Difficulty percentages based on total solved
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
    <Card className="bg-[#141414] border-gray-800/80 shadow-md">
      <CardHeader className="pb-4 border-b border-gray-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg text-white">LeetCode Problem Analysis</CardTitle>
                {connected && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                )}
              </div>
              <CardDescription className="text-gray-400 text-xs">
                {connected
                  ? "Real-time algorithmic analytics, difficulty breakdown, submission accuracy, contest standing, and topic strengths."
                  : "Connect your public LeetCode profile to import solved problems, topic mastery, contest rating, and benchmark placement readiness."}
              </CardDescription>
            </div>
          </div>

          {connected && (
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsChangingAccount((prev) => !prev);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                disabled={syncing || disconnecting || connecting}
                className="bg-[#1c1c1c] hover:bg-zinc-800 text-zinc-300 border-gray-700 text-xs h-8 px-2.5 flex items-center gap-1.5 cursor-pointer"
                title="Connect a different LeetCode account"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Change Account</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing || disconnecting || connecting}
                className="bg-[#1c1c1c] hover:bg-zinc-800 text-zinc-200 border-gray-700 text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer"
                title="Fetch latest stats from LeetCode"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-amber-400" : ""}`} />
                <span>{syncing ? "Syncing..." : "Refresh Data"}</span>
              </Button>

              {showConfirmDisconnect ? (
                <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-800/80 px-2 py-1 rounded-md">
                  <span className="text-[11px] text-rose-200 font-medium">Disconnect?</span>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="text-[11px] bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-0.5 rounded transition cursor-pointer"
                  >
                    {disconnecting ? "..." : "Yes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDisconnect(false)}
                    className="text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmDisconnect(true)}
                  disabled={syncing || disconnecting || connecting}
                  className="text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 text-xs h-8 px-2.5 cursor-pointer"
                  title="Disconnect LeetCode profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline ml-1">Disconnect</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Change Account Inline Modal */}
        {connected && isChangingAccount && (
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white font-mono">
                  Switch LeetCode Account
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                Current: @{profile?.username}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Enter the new LeetCode username or profile link below. Your current connection remains active until the new profile is verified.
            </p>
            <form
              onSubmit={(e) => handleConnect(e, changeUsernameInput)}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <Input
                type="text"
                value={changeUsernameInput}
                onChange={(e) => setChangeUsernameInput(e.target.value)}
                placeholder="new username or https://leetcode.com/u/new_user/"
                className="bg-[#141414] border-gray-700 text-white placeholder:text-gray-600 focus:border-amber-500 text-xs h-9 font-mono flex-1"
                disabled={connecting}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={connecting || !changeUsernameInput.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 px-3.5 font-medium cursor-pointer"
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Switch"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsChangingAccount(false);
                    setChangeUsernameInput("");
                  }}
                  className="text-zinc-400 hover:text-white text-xs h-9 px-2.5 cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Messages */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-600/60 text-emerald-200 px-3.5 py-2.5 rounded-lg text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-rose-950/70 border border-rose-600/60 text-rose-200 px-3.5 py-2.5 rounded-lg text-xs font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setErrorMsg("")}
                className="text-[11px] underline hover:text-white cursor-pointer font-mono"
              >
                Dismiss
              </button>
              <a
                href="https://leetcode.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-amber-300 hover:text-amber-200 underline font-mono flex items-center gap-0.5 cursor-pointer"
              >
                <span>Check on LeetCode</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}

        {/* Graceful sync failure banner */}
        {profile?.syncStatus === "failed" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-950/40 border border-amber-600/50 text-amber-200 p-3.5 rounded-xl text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-semibold text-amber-300">
                  Unable to fetch latest LeetCode data.
                </span>{" "}
                <span>Showing your last successfully synced data.</span>
                {profile.syncError && (
                  <div className="text-[11px] text-amber-400/80 font-mono mt-0.5">
                    Reason: {profile.syncError}
                  </div>
                )}
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
              className="bg-amber-900/40 hover:bg-amber-900/70 border-amber-600 text-amber-100 text-xs h-7 px-3 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Retrying..." : "Retry Sync"}
            </Button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CONNECTED STATE DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {connected && profile ? (
          <div className="space-y-6">
            {/* 1. LeetCode Profile Summary Banner */}
            <div className="bg-gradient-to-r from-amber-950/25 via-[#18181b] to-purple-950/25 border border-amber-900/30 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl font-mono shrink-0 shadow-inner">
                  {profile.username?.charAt(0)?.toUpperCase() || "L"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white text-base md:text-lg">
                      {profile.realName || profile.username}
                    </h3>
                    <a
                      href={profile.profileUrl || `https://leetcode.com/u/${profile.username}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-mono bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60 transition-colors cursor-pointer"
                      title="Open LeetCode profile in new tab"
                    >
                      <span>@{profile.username}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1.5 font-mono">
                    {profile.ranking ? (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        Rank #{profile.ranking.toLocaleString()}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Trophy className="w-3.5 h-3.5 text-zinc-600" />
                        Unranked
                      </span>
                    )}

                    {contestRating !== null && (
                      <span className="flex items-center gap-1 text-purple-300">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        Rating: {contestRating.toLocaleString()}
                      </span>
                    )}

                    {profile.lastSyncedAt && (
                      <span
                        className="flex items-center gap-1 text-zinc-500"
                        title={formatFullDateTime(profile.lastSyncedAt)}
                      >
                        <Clock className="w-3 h-3 text-zinc-500" />
                        Last synced: {formatFullDateTime(profile.lastSyncedAt)}
                        <span className="text-zinc-600">
                          ({formatRelativeTime(profile.lastSyncedAt)})
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Solved Overview Badge */}
              <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 rounded-xl shrink-0 self-start md:self-auto">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                    Total Solved
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono text-white">
                      {totalSolved}
                    </span>
                    {totalQuestions > 0 && (
                      <span className="text-xs font-mono text-zinc-500">
                        / {totalQuestions}
                      </span>
                    )}
                  </div>
                </div>
                {acceptanceRate !== null && (
                  <div className="pl-3 border-l border-zinc-800 space-y-0.5">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                      Accuracy
                    </div>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      {acceptanceRate}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-view switcher tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <button
                type="button"
                onClick={() => setActiveView("overview")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  activeView === "overview"
                    ? "bg-amber-600/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overview & Topic Strengths</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView("submissions")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  activeView === "submissions"
                    ? "bg-sky-600/20 text-sky-300 border border-sky-500/40 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
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
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                    Difficulty Distribution
                  </h4>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {totalSolved} problem{totalSolved === 1 ? "" : "s"} resolved
                </span>
              </div>

              {/* Combined Multi-segment Bar */}
              {totalSolved > 0 && (
                <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${easyPct}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`Easy: ${easySolved} (${easyPct}%)`}
                  />
                  <div
                    style={{ width: `${mediumPct}%` }}
                    className="bg-amber-500 transition-all duration-500"
                    title={`Medium: ${mediumSolved} (${mediumPct}%)`}
                  />
                  <div
                    style={{ width: `${hardPct}%` }}
                    className="bg-rose-500 transition-all duration-500"
                    title={`Hard: ${hardSolved} (${hardPct}%)`}
                  />
                </div>
              )}

              {/* Individual Difficulty Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Easy Card */}
                <div className="bg-[#18181b]/80 border border-emerald-900/30 rounded-xl p-4 space-y-2.5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Easy
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {easySolved}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
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
                  <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                    <span>Foundation</span>
                    <span className="text-emerald-400/90 font-semibold">{easyPct}% of solved</span>
                  </div>
                </div>

                {/* Medium Card */}
                <div className="bg-[#18181b]/80 border border-amber-900/30 rounded-xl p-4 space-y-2.5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Medium
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {mediumSolved}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
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
                  <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                    <span>Core Placement Bar</span>
                    <span className="text-amber-400/90 font-semibold">{mediumPct}% of solved</span>
                  </div>
                </div>

                {/* Hard Card */}
                <div className="bg-[#18181b]/80 border border-rose-900/30 rounded-xl p-4 space-y-2.5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Hard
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {hardSolved}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
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
                  <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                    <span>Advanced Mastery</span>
                    <span className="text-rose-400/90 font-semibold">{hardPct}% of solved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Middle Section: Submission Activity & Contest & Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Submission Activity Card */}
              <div className="bg-[#18181b]/70 border border-zinc-800/80 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                      Submission Activity
                    </h4>
                  </div>
                  {acceptanceRate !== null && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/60">
                      {acceptanceRate}% Success Rate
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="bg-zinc-900/80 border border-zinc-800/60 p-2.5 rounded-lg space-y-0.5">
                    <div className="text-[10px] text-zinc-400 font-mono uppercase">Total Submissions</div>
                    <div className="text-sm font-bold font-mono text-white">
                      {totalSubmissions !== null
                        ? totalSubmissions.toLocaleString()
                        : "Not available"}
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800/60 p-2.5 rounded-lg space-y-0.5">
                    <div className="text-[10px] text-emerald-400/90 font-mono uppercase">Accepted</div>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      {acceptedSubmissions !== null
                        ? acceptedSubmissions.toLocaleString()
                        : "Not available"}
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800/60 p-2.5 rounded-lg space-y-0.5 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-rose-400/90 font-mono uppercase">Rejected / Other</div>
                    <div className="text-sm font-bold font-mono text-rose-400">
                      {rejectedSubmissions !== null
                        ? rejectedSubmissions.toLocaleString()
                        : "Not available"}
                    </div>
                  </div>
                </div>

                {/* Accuracy meter */}
                {acceptanceRate !== null && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Acceptance Precision</span>
                      <span className="text-white font-semibold">{acceptanceRate}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, acceptanceRate))}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 pt-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {acceptanceRate !== null && acceptanceRate >= 60
                      ? "High submission accuracy indicates solid test-case reasoning and first-try correctness."
                      : "Refining edge-case testing before submitting improves acceptance efficiency."}
                  </span>
                </div>
              </div>

              {/* Contest & Rating Card */}
              <div className="bg-[#18181b]/70 border border-zinc-800/80 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                      Contest & Rating
                    </h4>
                  </div>
                  {contestBadge ? (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      {contestBadge}
                    </span>
                  ) : contestRating !== null ? (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60">
                      Active Competitor
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* Contest Rating */}
                  <div className="bg-zinc-900/80 border border-zinc-800/60 p-2.5 rounded-lg space-y-0.5">
                    <div className="text-[10px] text-zinc-400 font-mono uppercase">Contest Rating</div>
                    <div className="text-sm font-bold font-mono text-purple-300">
                      {contestRating !== null ? contestRating.toLocaleString() : "Not available"}
                    </div>
                  </div>

                  {/* Global Contest Rank */}
                  <div className="bg-zinc-900/80 border border-zinc-800/60 p-2.5 rounded-lg space-y-0.5">
                    <div className="text-[10px] text-zinc-400 font-mono uppercase">Global Rank</div>
                    <div className="text-sm font-bold font-mono text-amber-300">
                      {contestGlobalRank !== null
                        ? `#${contestGlobalRank.toLocaleString()}`
                        : "Not available"}
                    </div>
                  </div>

                  {/* Contests Attended (distinguish 0 from null!) */}
                  <div className="bg-zinc-900/80 border border-zinc-800/60 p-2.5 rounded-lg space-y-0.5 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-zinc-400 font-mono uppercase">Attended</div>
                    <div className="text-sm font-bold font-mono text-white">
                      {contestsAttended !== null
                        ? `${contestsAttended} contest${contestsAttended === 1 ? "" : "s"}`
                        : "Not available"}
                    </div>
                  </div>
                </div>

                {/* Top Percentage / Performance Note */}
                {contestTopPercentage !== null && (
                  <div className="flex items-center justify-between text-[11px] font-mono bg-purple-950/30 border border-purple-900/40 p-2 rounded-lg">
                    <span className="text-purple-300">Competitive Standing</span>
                    <span className="text-amber-300 font-semibold">
                      Top {contestTopPercentage}% of all contestants
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 pt-1">
                  <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>
                    {contestRating !== null
                      ? "Weekly & Biweekly contest performance showcases speed and real-time algorithmic agility."
                      : "Participate in LeetCode contests to unlock global competitive ratings and percentile benchmarks."}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Programming Languages Card */}
            <div className="bg-[#18181b]/70 border border-zinc-800/80 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                    Programming Languages
                  </h4>
                </div>
                {primaryLanguage && (
                  <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-700/60 px-2.5 py-0.5 rounded-md text-[11px] font-mono text-amber-300">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>Primary: <strong>{primaryLanguage.name}</strong> ({primaryLanguage.solved} solved)</span>
                  </div>
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
                        className={`p-3 rounded-lg border transition-all ${
                          isPrimary
                            ? "bg-amber-950/20 border-amber-700/50 shadow-sm"
                            : "bg-zinc-900/60 border-zinc-800/70"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                            {isPrimary && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                            {lang.languageName}
                          </span>
                          <span className="font-mono text-zinc-400">
                            {lang.problemsSolved} solved
                          </span>
                        </div>
                        <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isPrimary ? "bg-amber-400" : "bg-zinc-600"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(8, (lang.problemsSolved / maxLangCount) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-end text-[10px] text-zinc-500 font-mono mt-1">
                          <span>{pct}% of profile</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-zinc-500 font-mono py-4 text-center bg-zinc-900/40 rounded-lg">
                  No language data available.
                </div>
              )}
            </div>

            {/* 5. Topic Strengths Section */}
            {topicTags.length > 0 && (
              <div className="bg-[#18181b]/70 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                      Topic Strengths ({topicTags.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">Problems Solved by Topic</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(showAllTopics ? topicTags : topicTags.slice(0, 16)).map((tag, idx) => (
                    <div
                      key={tag.tagSlug || idx}
                      className="inline-flex items-center gap-1.5 bg-[#1a1a1e] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded-md text-xs transition-colors"
                    >
                      <span className="text-zinc-300 font-medium">{tag.tagName}</span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60">
                        {tag.problemsSolved}
                      </span>
                    </div>
                  ))}
                </div>

                {topicTags.length > 16 && (
                  <div className="pt-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllTopics((prev) => !prev)}
                      className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 cursor-pointer transition-colors"
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
            <div className="bg-[#18181b]/70 border border-zinc-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                    Recent Submissions
                  </h4>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {recentSubmissions.length} recent activity logs
                </span>
              </div>

              {recentSubmissions.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {recentSubmissions.map((sub, idx) => {
                    const isAccepted = sub.statusDisplay === "Accepted";
                    const isWrong = sub.statusDisplay === "Wrong Answer";
                    const isTLE = sub.statusDisplay === "Time Limit Exceeded";

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-2 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 gap-2 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isAccepted ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            {sub.titleSlug ? (
                              <a
                                href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-zinc-200 hover:text-amber-400 font-medium truncate inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>{sub.title || sub.titleSlug}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                              </a>
                            ) : (
                              <div className="text-zinc-200 font-medium truncate">
                                {sub.title || "Submission"}
                              </div>
                            )}
                            <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                              {sub.lang && (
                                <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
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
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                              isAccepted
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isWrong
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : isTLE
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
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
                <div className="text-xs text-zinc-500 font-mono py-6 text-center bg-zinc-900/40 rounded-lg">
                  No recent submissions recorded on public endpoint.
                </div>
              )}
            </div>
              </>
            )}
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* DISCONNECTED STATE: CONNECTION FORM */
          /* ------------------------------------------------------------- */
          <div className="space-y-5">
            <div className="bg-[#18181b]/50 border border-dashed border-zinc-800 rounded-xl p-5 md:p-6 space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">
                  Connect your LeetCode profile
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  Enter your public LeetCode username or profile link below. We query LeetCode’s public GraphQL endpoints to import your verified problem counts, difficulty breakdown, submission activity, contest ranking, and programming languages.
                </p>
              </div>

              <form onSubmit={handleConnect} className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500/80 font-mono text-xs">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <Input
                      type="text"
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      placeholder="Enter LeetCode username (e.g. tourist) or profile URL"
                      className="bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 pl-10 text-xs h-10 font-mono"
                      disabled={connecting}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={connecting || !inputUsername.trim()}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-5 h-10 rounded-md shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs shrink-0"
                  >
                    {connecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying & Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Code2 className="w-4 h-4" />
                        <span>Connect LeetCode →</span>
                      </>
                    )}
                  </Button>
                </div>

                {connecting && (
                  <div className="text-[11px] font-mono text-amber-300 flex items-center gap-2 bg-amber-950/40 border border-amber-800/40 px-3 py-2 rounded-lg">
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400 shrink-0" />
                    <span>Querying LeetCode public GraphQL: Verifying profile, solved counts, accuracy, and topic breakdown...</span>
                  </div>
                )}

                {/* Privacy & Security Guarantee */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 pt-1">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Public stats only
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    No password or token required
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Auto-updates readiness score
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
