import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NODE_API_URL } from "@/config/api";

export default function LeetCodeConnectCard({ onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

  const [inputUsername, setInputUsername] = useState("");
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
      const response = await axios.get(`${NODE_API_URL}/api/leetcode/profile`, {
        withCredentials: true,
      });

      if (response.data?.connected && response.data?.profile) {
        setProfile(response.data.profile);
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

  const handleConnect = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanInput = inputUsername.trim();
    if (!cleanInput) {
      setErrorMsg("Please enter your LeetCode username or profile URL");
      return;
    }

    setConnecting(true);
    try {
      const response = await axios.post(
        `${NODE_API_URL}/api/leetcode/connect`,
        { username: cleanInput },
        { withCredentials: true }
      );

      if (response.data?.profile) {
        setProfile(response.data.profile);
        setConnected(true);
        setInputUsername("");
        setSuccessMsg(
          response.data.message || `Successfully connected @${response.data.profile.username}!`
        );
        if (onProfileUpdate) onProfileUpdate(response.data.profile);
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
      const response = await axios.post(
        `${NODE_API_URL}/api/leetcode/sync`,
        {},
        { withCredentials: true }
      );

      if (response.data?.profile) {
        setProfile(response.data.profile);
        setSuccessMsg(response.data.message || "LeetCode stats refreshed successfully!");
        if (onProfileUpdate) onProfileUpdate(response.data.profile);
      }
    } catch (err) {
      console.error("Error syncing LeetCode stats:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to refresh LeetCode data. Please verify your connection."
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setDisconnecting(true);

    try {
      await axios.delete(`${NODE_API_URL}/api/leetcode/disconnect`, {
        withCredentials: true,
      });

      setProfile(null);
      setConnected(false);
      setShowConfirmDisconnect(false);
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

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays === 1) return "yesterday";
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
        const date = new Date(num * 1000);
        return formatTimestamp(date);
      }
      return formatTimestamp(ts);
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
          <Skeleton className="h-24 w-full bg-gray-800/40 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-20 bg-gray-800/30 rounded-lg" />
            <Skeleton className="h-20 bg-gray-800/30 rounded-lg" />
            <Skeleton className="h-20 bg-gray-800/30 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
                <CardTitle className="text-lg text-white">LeetCode Integration</CardTitle>
                {connected && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                )}
              </div>
              <CardDescription className="text-gray-400 text-xs">
                {connected
                  ? "Public statistics synced and integrated into your algorithmic placement readiness score."
                  : "Connect your public LeetCode profile to import solved problems, topic mastery, and benchmark placement readiness."}
              </CardDescription>
            </div>
          </div>

          {connected && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing || disconnecting}
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
                  disabled={syncing || disconnecting}
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
        {/* Messages */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-600/60 text-emerald-200 px-3.5 py-2.5 rounded-lg text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 bg-rose-950/70 border border-rose-600/60 text-rose-200 px-3.5 py-2.5 rounded-lg text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {profile?.syncStatus === "failed" && (
          <div className="flex items-center justify-between gap-3 bg-amber-950/50 border border-amber-600/50 text-amber-200 p-3 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Last background sync failed: {profile.syncError || "Could not reach LeetCode"}.</span>
            </div>
            <button
              type="button"
              onClick={handleSync}
              className="underline hover:text-white font-medium shrink-0 cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* CONNECTED STATE DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {connected && profile ? (
          <div className="space-y-6">
            {/* Top Identity Banner */}
            <div className="bg-gradient-to-r from-amber-950/20 via-[#18181b] to-purple-950/20 border border-amber-900/30 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl font-mono shrink-0">
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
                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 transition-colors cursor-pointer"
                    >
                      <span>@{profile.username}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
                    {profile.ranking && (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        Rank #{profile.ranking.toLocaleString()}
                      </span>
                    )}
                    {profile.lastSyncedAt && (
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        Synced {formatTimestamp(profile.lastSyncedAt)}
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
                      {profile.totalSolved}
                    </span>
                    {profile.totalQuestions > 0 && (
                      <span className="text-xs font-mono text-zinc-500">
                        / {profile.totalQuestions}
                      </span>
                    )}
                  </div>
                </div>
                {profile.acceptanceRate > 0 && (
                  <div className="pl-3 border-l border-zinc-800 space-y-0.5">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                      Accuracy
                    </div>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      {profile.acceptanceRate}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Easy Card */}
              <div className="bg-[#18181b]/80 border border-emerald-900/30 rounded-xl p-4 space-y-2.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                    Easy
                  </span>
                  <span className="text-sm font-bold font-mono text-white">
                    {profile.easySolved}
                  </span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, (profile.easySolved / Math.max(1, profile.totalSolved || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Foundation</span>
                  <span>{profile.totalSolved > 0 ? Math.round((profile.easySolved / profile.totalSolved) * 100) : 0}% of solved</span>
                </div>
              </div>

              {/* Medium Card */}
              <div className="bg-[#18181b]/80 border border-amber-900/30 rounded-xl p-4 space-y-2.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
                    Medium
                  </span>
                  <span className="text-sm font-bold font-mono text-white">
                    {profile.mediumSolved}
                  </span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, (profile.mediumSolved / Math.max(1, profile.totalSolved || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Core Placement Bar</span>
                  <span>{profile.totalSolved > 0 ? Math.round((profile.mediumSolved / profile.totalSolved) * 100) : 0}% of solved</span>
                </div>
              </div>

              {/* Hard Card */}
              <div className="bg-[#18181b]/80 border border-rose-900/30 rounded-xl p-4 space-y-2.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-rose-400">
                    Hard
                  </span>
                  <span className="text-sm font-bold font-mono text-white">
                    {profile.hardSolved}
                  </span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, (profile.hardSolved / Math.max(1, profile.totalSolved || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Advanced Mastery</span>
                  <span>{profile.totalSolved > 0 ? Math.round((profile.hardSolved / profile.totalSolved) * 100) : 0}% of solved</span>
                </div>
              </div>
            </div>

            {/* Topic Strengths Section */}
            {profile.topicTags && profile.topicTags.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                      Topic Strengths ({profile.topicTags.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">Problems Solved</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.topicTags.slice(0, 16).map((tag, idx) => (
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
                  {profile.topicTags.length > 16 && (
                    <span className="text-xs text-zinc-500 self-center px-1 font-mono">
                      +{profile.topicTags.length - 16} more topics
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Row: Languages & Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div className="bg-[#18181b]/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                      Languages Used
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {profile.languages.slice(0, 5).map((lang, idx) => (
                      <div
                        key={lang.languageName || idx}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded bg-zinc-900/60 border border-zinc-800/60"
                      >
                        <span className="text-zinc-300 font-medium">{lang.languageName}</span>
                        <span className="text-zinc-400 font-mono">{lang.problemsSolved} solved</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity / Submissions */}
              <div className="bg-[#18181b]/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                    Recent Submissions
                  </h4>
                </div>

                {profile.recentSubmissions && profile.recentSubmissions.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {profile.recentSubmissions.slice(0, 5).map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-zinc-900/60 border border-zinc-800/60 gap-2"
                      >
                        <div className="truncate pr-2">
                          <div className="text-zinc-200 font-medium truncate">{sub.title}</div>
                          <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                            {sub.lang && <span>{sub.lang}</span>}
                            {sub.timestamp && <span>· {formatSubmissionTime(sub.timestamp)}</span>}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold shrink-0 ${
                            sub.statusDisplay === "Accepted"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {sub.statusDisplay || "Submitted"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 font-mono py-4 text-center">
                    No recent submissions recorded on public endpoint.
                  </div>
                )}
              </div>
            </div>
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
                  Enter your public LeetCode username or profile link below. We query LeetCode’s public GraphQL endpoints to import your verified problem counts, topic distribution, and global ranking.
                </p>
              </div>

              <form onSubmit={handleConnect} className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 font-mono text-xs">
                      leetcode.com/u/
                    </div>
                    <Input
                      type="text"
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      placeholder="username (e.g. tourist or https://leetcode.com/u/tourist/)"
                      className="bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-600 focus:border-amber-500 pl-32 text-xs h-10 font-mono"
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
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Code2 className="w-4 h-4" />
                        <span>Connect LeetCode</span>
                      </>
                    )}
                  </Button>
                </div>

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
