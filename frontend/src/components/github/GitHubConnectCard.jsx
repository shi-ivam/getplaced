import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FolderGit2,
  ExternalLink,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Star,
  GitFork,
  Globe,
  Search,
  Sparkles,
  ShieldCheck,
  Code2,
  BookOpen,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NODE_API_URL } from "@/config/api";

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Shell: "#89e051",
  R: "#198CE7",
  Scala: "#c22d40",
  Jupyter: "#DA5B0B",
};

export default function GitHubConnectCard({ onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

  const [activeTab, setActiveTab] = useState("featured"); // 'featured' | 'all'
  const [inputUsername, setInputUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Repository Explorer Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // 'all' | 'original' | 'fork'
  const [sortBy, setSortBy] = useState("stars"); // 'stars' | 'updated' | 'pushed' | 'name' | 'size'
  const [selectedRepoModal, setSelectedRepoModal] = useState(null);

  // Fetch connected profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await axios.get(`${NODE_API_URL}/api/github/profile`, {
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
      console.error("Error fetching GitHub profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg("");
    setSuccessMsg("");

    const cleanInput = inputUsername.trim();
    if (!cleanInput) {
      setErrorMsg("Please enter your GitHub username or profile URL");
      return;
    }

    setConnecting(true);
    try {
      const response = await axios.post(
        `${NODE_API_URL}/api/github/connect`,
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
      console.error("Error connecting GitHub account:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to connect GitHub profile. Please check the username or profile URL."
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
        `${NODE_API_URL}/api/github/sync`,
        {},
        { withCredentials: true }
      );

      if (response.data?.profile) {
        setProfile(response.data.profile);
        setSuccessMsg(response.data.message || "GitHub data refreshed successfully!");
        if (onProfileUpdate) onProfileUpdate(response.data.profile);
      }
    } catch (err) {
      console.error("Error syncing GitHub stats:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to refresh GitHub data. Please verify your connection."
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
      await axios.delete(`${NODE_API_URL}/api/github/disconnect`, {
        withCredentials: true,
      });

      setProfile(null);
      setConnected(false);
      setShowConfirmDisconnect(false);
      setSuccessMsg("GitHub account disconnected successfully");
      if (onProfileUpdate) onProfileUpdate(null);
    } catch (err) {
      console.error("Error disconnecting GitHub:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to disconnect GitHub profile."
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

  // Filter and sort all repositories for Explorer tab
  const repositories = useMemo(() => profile?.repositories || [], [profile?.repositories]);
  const filteredRepositories = useMemo(() => {
    let list = [...repositories];

    // 1. Language Filter
    if (selectedLanguage !== "all") {
      list = list.filter(
        (r) => (r.language || "").toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

    // 2. Type Filter
    if (selectedType === "original") {
      list = list.filter((r) => !r.isFork);
    } else if (selectedType === "fork") {
      list = list.filter((r) => r.isFork);
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((r) => {
        const nameMatch = (r.name || "").toLowerCase().includes(q);
        const descMatch = (r.description || "").toLowerCase().includes(q);
        const topicMatch = Array.isArray(r.topics) && r.topics.some((t) => t.toLowerCase().includes(q));
        return nameMatch || descMatch || topicMatch;
      });
    }

    // 4. Sort
    list.sort((a, b) => {
      if (sortBy === "stars") return (b.stars || 0) - (a.stars || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "size") return (b.size || 0) - (a.size || 0);
      if (sortBy === "pushed") {
        const aT = a.pushedAt ? new Date(a.pushedAt).getTime() : 0;
        const bT = b.pushedAt ? new Date(b.pushedAt).getTime() : 0;
        return bT - aT;
      }
      // default: updated
      const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bT - aT;
    });

    return list;
  }, [repositories, selectedLanguage, selectedType, searchQuery, sortBy]);

  const topReposList = profile?.topRepositories || [];
  const languagesList = profile?.languages || [];

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 bg-gray-800/30 rounded-lg" />
            <Skeleton className="h-24 bg-gray-800/30 rounded-lg" />
            <Skeleton className="h-24 bg-gray-800/30 rounded-lg" />
            <Skeleton className="h-24 bg-gray-800/30 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const projectScore = profile?.projectScore || 0;
  const getScoreBadgeClass = (score) => {
    if (score >= 85) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (score >= 70) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if (score >= 50) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  return (
    <Card className="bg-[#121215] border-zinc-800 shadow-none">
      <CardHeader className="pb-4 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-white">GitHub Portfolio</CardTitle>
                {connected && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                )}
              </div>
              {!connected && (
                <CardDescription className="text-zinc-400 text-xs mt-0.5">
                  Import public repositories, language distribution, and project statistics.
                </CardDescription>
              )}
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
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer"
                title="Fetch latest repositories from GitHub"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-zinc-200" : "text-zinc-400"}`} />
                <span>{syncing ? "Syncing..." : "Refresh Data"}</span>
              </Button>

              {showConfirmDisconnect ? (
                <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-800 px-2 py-1 rounded-md">
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
                  title="Disconnect GitHub account"
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
        {/* Alerts & Messages */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3.5 py-2.5 rounded-lg text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3.5 py-2.5 rounded-lg text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Graceful sync failure alert */}
        {profile?.syncStatus === "failed" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3.5 rounded-xl text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-semibold text-amber-300">
                  Unable to refresh GitHub repositories.
                </span>{" "}
                <span>Showing cached repository snapshot.</span>
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
              className="bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200 text-xs h-7 px-3 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${syncing ? "animate-spin text-zinc-300" : ""}`} />
              {syncing ? "Retrying..." : "Retry Sync"}
            </Button>
          </div>
        )}

        {/* DISCONNECTED STATE */}
        {!connected && (
          <div className="space-y-6">
            <div className="bg-[#14141c] border border-zinc-800 rounded-xl p-5 md:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Connect GitHub Account
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-xl">
                    Import public repositories to evaluate projects and language breakdown.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shrink-0 self-start sm:self-auto font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Public Read-Only</span>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleConnect} className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    placeholder="e.g. username, or https://github.com/username"
                    className="bg-[#0f1017] border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500 text-sm h-10 pr-10 font-mono"
                    disabled={connecting}
                  />
                  {inputUsername && (
                    <button
                      type="button"
                      onClick={() => setInputUsername("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={connecting || !inputUsername.trim()}
                  className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium px-5 h-10 rounded-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer text-xs"
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FolderGit2 className="w-3.5 h-3.5" />
                      Connect GitHub
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* CONNECTED STATE DASHBOARD */}
        {connected && profile && (
          <div className="space-y-6">
            {/* 1. Header Hero Card with Profile Metadata */}
            <div className="bg-[#14141c] border border-zinc-800 p-4 md:p-5 rounded-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Avatar + Identity */}
                <div className="flex items-center gap-4">
                  <img
                    src={profile.avatarUrl || `https://github.com/${profile.username}.png`}
                    alt={profile.username}
                    className="w-12 h-12 rounded-xl border border-zinc-800 object-cover bg-zinc-900 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
                    }}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white text-base">
                        {profile.name || profile.username}
                      </h3>
                      <a
                        href={profile.profileUrl || `https://github.com/${profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-zinc-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                      >
                        <span>@{profile.username}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    </div>
                    {profile.bio && (
                      <p className="text-xs text-zinc-400 mt-1 max-w-xl line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Readiness Project Score Badge */}
                <div className="bg-[#0f1017] border border-zinc-800 px-3.5 py-2.5 rounded-lg flex items-center gap-3 shrink-0 self-start md:self-auto">
                  <div>
                    <div className="text-[10px] text-zinc-400 font-mono uppercase">Projects Score</div>
                    <div className="text-lg font-bold font-mono text-white">
                      {projectScore}/100
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${getScoreBadgeClass(
                      projectScore
                    )}`}
                  >
                    {profile.scoreTier || "Strong"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Portfolio Quick Metrics (4 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-[#14141c] border border-zinc-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] uppercase font-mono tracking-wider">Total Repos</span>
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {profile.publicReposCount || (profile.repositories ? profile.repositories.length : 0)}
                </div>
              </div>

              <div className="bg-[#14141c] border border-zinc-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] uppercase font-mono tracking-wider">Original Projects</span>
                  <FolderGit2 className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-200">
                  {profile.originalReposCount || 0}
                </div>
              </div>

              <div className="bg-[#14141c] border border-zinc-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] uppercase font-mono tracking-wider">Total Stars</span>
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {profile.totalStars || 0}
                </div>
              </div>

              <div className="bg-[#14141c] border border-zinc-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-[10px] uppercase font-mono tracking-wider">Total Forks</span>
                  <GitFork className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-200">
                  {profile.totalForks || 0}
                </div>
              </div>
            </div>

            {/* 3. Top Languages Breakdown */}
            {languagesList.length > 0 && (
              <div className="bg-[#14141c] border border-zinc-800 rounded-xl p-4 md:p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-zinc-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                      Language Distribution
                    </h4>
                  </div>
                </div>

                {/* Multi-segment Colored Bar */}
                <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden flex shadow-inner">
                  {languagesList.slice(0, 7).map((lang, idx) => {
                    const color = LANGUAGE_COLORS[lang.languageName] || "#a1a1aa";
                    return (
                      <div
                        key={idx}
                        style={{ width: `${lang.percentage}%`, backgroundColor: color }}
                        className="h-full transition-all duration-500"
                        title={`${lang.languageName}: ${lang.percentage}% (${lang.repoCount} repos)`}
                      />
                    );
                  })}
                </div>

                {/* Language Pill Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {languagesList.map((lang, idx) => {
                    const color = LANGUAGE_COLORS[lang.languageName] || "#a1a1aa";
                    return (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0f1017] border border-zinc-800 text-xs font-mono text-zinc-300"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-white">{lang.languageName}</span>
                        <span className="text-zinc-500 text-[11px]">
                          {lang.percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Tab Switcher (Featured Repos vs All Repos Explorer) */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("featured")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeTab === "featured"
                      ? "bg-zinc-100 text-zinc-950 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Featured Repositories</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    activeTab === "all"
                      ? "bg-zinc-100 text-zinc-950 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800"
                  }`}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>All Repositories</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Featured Repositories Grid */}
            {activeTab === "featured" && (
              <div className="space-y-4">
                {topReposList.length === 0 ? (
                  <div className="text-center py-10 bg-zinc-900/40 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-mono">
                    No public repositories found for this account.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topReposList.map((repo, idx) => (
                      <RepositoryCard
                        key={repo.githubId || idx}
                        repo={repo}
                        onSelectRepo={setSelectedRepoModal}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: All Repositories Explorer with Live Filters & Search */}
            {activeTab === "all" && (
              <div className="space-y-4">
                {/* Filter Controls Bar */}
                <div className="bg-[#14141c] border border-zinc-800 p-3.5 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search repositories..."
                        className="pl-9 bg-[#0f1017] border-zinc-700 text-white placeholder:text-zinc-600 text-xs h-9"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Language Filter */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="bg-[#0f1017] border border-zinc-700 rounded-md text-xs text-zinc-200 px-2.5 py-1.5 focus:outline-none focus:border-zinc-500 font-mono cursor-pointer h-9"
                      >
                        <option value="all">All Languages</option>
                        {languagesList.map((lang) => (
                          <option key={lang.languageName} value={lang.languageName}>
                            {lang.languageName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-[#0f1017] border border-zinc-700 rounded-md text-xs text-zinc-200 px-2.5 py-1.5 focus:outline-none focus:border-zinc-500 font-mono cursor-pointer h-9"
                      >
                        <option value="all">All Types</option>
                        <option value="original">Original Only</option>
                        <option value="fork">Forks Only</option>
                      </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[#0f1017] border border-zinc-700 rounded-md text-xs text-zinc-200 px-2.5 py-1.5 focus:outline-none focus:border-zinc-500 font-mono cursor-pointer h-9"
                      >
                        <option value="stars">Sort: Most Stars</option>
                        <option value="updated">Sort: Recently Updated</option>
                        <option value="pushed">Sort: Recently Pushed</option>
                        <option value="name">Sort: Name (A-Z)</option>
                        <option value="size">Sort: Codebase Size</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1 border-t border-zinc-800">
                    <span>
                      Showing {filteredRepositories.length} of {repositories.length} repositories
                    </span>
                    {(searchQuery || selectedLanguage !== "all" || selectedType !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedLanguage("all");
                          setSelectedType("all");
                          setSortBy("stars");
                        }}
                        className="text-zinc-300 hover:text-white underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtered Repos Grid */}
                {filteredRepositories.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-mono space-y-2">
                    <p>No repositories matched your filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedLanguage("all");
                        setSelectedType("all");
                      }}
                      className="text-zinc-300 hover:underline cursor-pointer"
                    >
                      Clear search & filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRepositories.map((repo, idx) => (
                      <RepositoryCard
                        key={repo.githubId || idx}
                        repo={repo}
                        onSelectRepo={setSelectedRepoModal}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Progressive Project Detail Modal */}
      {selectedRepoModal && (
        <div
          onClick={() => setSelectedRepoModal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
          >
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white font-mono">
                    {selectedRepoModal.name}
                  </h3>
                  {selectedRepoModal.isFork && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                      Fork
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  {selectedRepoModal.description || "Production repository codebase."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRepoModal(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono">
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Language</span>
                <span className="font-bold text-zinc-200">{selectedRepoModal.language || "TypeScript"}</span>
              </div>
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Stars</span>
                <span className="font-bold text-amber-400">{selectedRepoModal.stars || 0}</span>
              </div>
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Forks</span>
                <span className="font-bold text-zinc-200">{selectedRepoModal.forks || 0}</span>
              </div>
            </div>

            {/* Architecture Verdict */}
            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                Repository Assessment
              </span>
              <p className="text-zinc-300 font-sans leading-relaxed text-xs">
                {selectedRepoModal.isFork
                  ? "Open-source contribution and upstream repository fork."
                  : (selectedRepoModal.stars > 5 || selectedRepoModal.hasLiveDemo)
                  ? "Production project with verified architectural complexity."
                  : "Application repository. Add a live demo URL to demonstrate availability."}
              </p>
            </div>

            {/* Topics */}
            {selectedRepoModal.topics && selectedRepoModal.topics.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Topics</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRepoModal.topics.map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
              {selectedRepoModal.hasLiveDemo && selectedRepoModal.liveDemoUrl && (
                <a
                  href={selectedRepoModal.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Open Live Demo</span>
                </a>
              )}
              <a
                href={selectedRepoModal.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3 text-zinc-500" />
              </a>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function RepositoryCard({ repo, onSelectRepo }) {
  const langColor = LANGUAGE_COLORS[repo.language] || "#a1a1aa";

  return (
    <div className="bg-[#14141c] hover:bg-[#181924] border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all group">
      <div className="space-y-2">
        {/* Title & Badges Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <FolderGit2 className="w-4 h-4 text-zinc-400 shrink-0" />
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-white hover:text-zinc-200 truncate font-mono flex items-center gap-1 group-hover:underline"
            >
              <span>{repo.name}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
            </a>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
            {repo.isFork && (
              <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                Fork
              </span>
            )}
            {repo.isArchived && (
              <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                Archived
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {repo.description || <span className="text-zinc-600 italic">No description provided.</span>}
        </p>

        {/* Topics Pills */}
        {Array.isArray(repo.topics) && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {repo.topics.slice(0, 4).map((topic, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#0f1017] text-zinc-300 border border-zinc-800 font-mono"
              >
                #{topic}
              </span>
            ))}
            {repo.topics.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-900 text-zinc-500 font-mono">
                +{repo.topics.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3 text-zinc-400">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: langColor }}
              />
              <span className="text-zinc-300">{repo.language}</span>
            </span>
          )}

          <span className="flex items-center gap-1 text-zinc-300" title={`${repo.stars} stars`}>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>{repo.stars || 0}</span>
          </span>

          {repo.forks > 0 && (
            <span className="flex items-center gap-1 text-zinc-400" title={`${repo.forks} forks`}>
              <GitFork className="w-3.5 h-3.5 text-zinc-500" />
              <span>{repo.forks}</span>
            </span>
          )}
        </div>

        {/* Links */}
        <div className="flex items-center gap-2">
          {onSelectRepo && (
            <button
              type="button"
              onClick={() => onSelectRepo(repo)}
              className="text-zinc-400 hover:text-emerald-400 text-[11px] font-mono px-2 py-0.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              [ Details ]
            </button>
          )}

          {repo.hasLiveDemo && repo.liveDemoUrl && (
            <a
              href={repo.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Globe className="w-3 h-3 text-zinc-400" />
              <span>Live Demo</span>
            </a>
          )}

          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] transition-colors cursor-pointer"
          >
            <span>GitHub</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
