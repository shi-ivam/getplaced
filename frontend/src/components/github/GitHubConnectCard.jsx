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
  Eye,
  Globe,
  MapPin,
  Building,
  Link2,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  Sparkles,
  ShieldCheck,
  Code2,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  Radio,
  BookOpen,
  X,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";
import GpButton, { GpArrow } from "@/components/gp/GpButton";
import GpCard from "@/components/gp/GpCard";

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
      <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 shadow-[6px_6px_0_0_#0D0431] space-y-4">
        <div className="h-6 w-48 bg-[#FEF9CF] rounded-xl animate-pulse border border-[#0D0431]" />
        <div className="h-28 w-full bg-[#FAF7EE] rounded-2xl animate-pulse border border-[#0D0431]" />
      </div>
    );
  }

  const projectScore = profile?.projectScore || 0;
  const getScoreBadgeTheme = (score) => {
    if (score >= 85) return "mint";
    if (score >= 70) return "light-purple";
    if (score >= 50) return "yellow";
    return "coral";
  };

  return (
    <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0_0_#0D0431] space-y-6 text-[#0D0431]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#0D0431] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E4CDFB] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center justify-center text-[#0D0431]">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-xl text-[#0D0431]">GitHub Portfolio</h3>
              {connected && (
                <GpBadge theme="mint">
                  Connected
                </GpBadge>
              )}
            </div>
            {!connected && (
              <p className="text-xs text-[#0D0431]/80 mt-0.5 font-medium">
                Import public repositories, language distribution, and project statistics.
              </p>
            )}
          </div>
        </div>

        {connected && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || disconnecting}
              className="btn_secondary_wrap px-4 py-2 text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5"
              title="Fetch latest repositories from GitHub"
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
                disabled={syncing || disconnecting}
                className="p-2 rounded-xl border-2 border-[#0D0431] bg-white hover:bg-[#FFC5B7] text-[#0D0431] transition-all shadow-[2px_2px_0_0_#0D0431] text-xs font-bold font-mono cursor-pointer flex items-center gap-1"
                title="Disconnect GitHub account"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Disconnect</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Alerts */}
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
              <span>Unable to refresh GitHub repositories. Showing cached snapshot.</span>
              {profile.syncError && (
                <div className="text-[11px] text-[#0D0431]/70 mt-0.5 font-normal">
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

      {/* DISCONNECTED STATE */}
      {!connected && (
        <div className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl p-6 space-y-4 shadow-[4px_4px_0_0_#0D0431]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#896EE2]" />
                <h3 className="font-heading font-black text-base text-[#0D0431]">
                  Connect GitHub Account
                </h3>
              </div>
              <p className="text-xs text-[#0D0431]/80 font-medium">
                Import public repositories to evaluate projects and language breakdown.
              </p>
            </div>

            <GpBadge theme="mint">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Public Read-Only
            </GpBadge>
          </div>

          <form onSubmit={handleConnect} className="flex flex-col sm:flex-row items-stretch gap-3 pt-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="e.g. torvalds, @username, or https://github.com/username"
                className="w-full bg-white text-[#0D0431] placeholder-[#0D0431]/40 border-2 border-[#0D0431] rounded-xl px-4 py-2.5 text-xs font-mono font-bold shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF]"
                disabled={connecting}
              />
              {inputUsername && (
                <button
                  type="button"
                  onClick={() => setInputUsername("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#0D0431] hover:text-[#896EE2] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <GpButton
              type="submit"
              disabled={connecting || !inputUsername.trim()}
              variant="stacked"
              size="md"
            >
              {connecting ? "Connecting..." : "Connect GitHub"}
            </GpButton>
          </form>
        </div>
      )}

      {/* CONNECTED STATE DASHBOARD */}
      {connected && profile && (
        <div className="space-y-6">
          {/* 1. Header Hero Card */}
          <div className="bg-[#FEF9CF] border-2 border-[#0D0431] p-5 rounded-2xl shadow-[4px_4px_0_0_#0D0431]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatarUrl || `https://github.com/${profile.username}.png`}
                  alt={profile.username}
                  className="w-14 h-14 rounded-2xl border-2 border-[#0D0431] object-cover bg-white shadow-[2px_2px_0_0_#0D0431] shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
                  }}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-heading font-black text-lg text-[#0D0431]">
                      {profile.name || profile.username}
                    </h3>
                    <a
                      href={profile.profileUrl || `https://github.com/${profile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-bold text-[#0D0431] hover:underline inline-flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-[#0D0431]"
                    >
                      <span>@{profile.username}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {profile.bio && (
                    <p className="text-xs text-[#0D0431]/80 mt-1 max-w-xl font-medium line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Projects Score Badge */}
              <div className="bg-white border-2 border-[#0D0431] px-4 py-3 rounded-2xl shadow-[3px_3px_0_0_#0D0431] flex items-center gap-3.5 shrink-0 self-start md:self-auto">
                <div>
                  <div className="text-[10px] text-[#0D0431]/70 font-mono font-bold uppercase">Projects Score</div>
                  <div className="text-2xl font-heading font-black text-[#0D0431]">
                    {projectScore}/100
                  </div>
                </div>
                <GpBadge theme={getScoreBadgeTheme(projectScore)}>
                  {profile.scoreTier || "Strong"}
                </GpBadge>
              </div>
            </div>
          </div>

          {/* 2. Portfolio Quick Metrics (4 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#FAF7EE] border-2 border-[#0D0431] rounded-2xl p-4 space-y-1 shadow-[3px_3px_0_0_#0D0431]">
              <div className="flex items-center justify-between text-[#0D0431]/70">
                <span className="text-[10px] uppercase font-mono font-bold">Total Repos</span>
                <BookOpen className="w-4 h-4 text-[#0D0431]" />
              </div>
              <div className="text-2xl font-heading font-black text-[#0D0431]">
                {profile.publicReposCount || (profile.repositories ? profile.repositories.length : 0)}
              </div>
            </div>

            <div className="bg-[#FAF7EE] border-2 border-[#0D0431] rounded-2xl p-4 space-y-1 shadow-[3px_3px_0_0_#0D0431]">
              <div className="flex items-center justify-between text-[#0D0431]/70">
                <span className="text-[10px] uppercase font-mono font-bold">Original Projects</span>
                <FolderGit2 className="w-4 h-4 text-[#0D0431]" />
              </div>
              <div className="text-2xl font-heading font-black text-[#0D0431]">
                {profile.originalReposCount || 0}
              </div>
            </div>

            <div className="bg-[#FAF7EE] border-2 border-[#0D0431] rounded-2xl p-4 space-y-1 shadow-[3px_3px_0_0_#0D0431]">
              <div className="flex items-center justify-between text-[#0D0431]/70">
                <span className="text-[10px] uppercase font-mono font-bold">Total Stars</span>
                <Star className="w-4 h-4 text-[#0D0431]" />
              </div>
              <div className="text-2xl font-heading font-black text-[#0D0431]">
                {profile.totalStars || 0}
              </div>
            </div>

            <div className="bg-[#FAF7EE] border-2 border-[#0D0431] rounded-2xl p-4 space-y-1 shadow-[3px_3px_0_0_#0D0431]">
              <div className="flex items-center justify-between text-[#0D0431]/70">
                <span className="text-[10px] uppercase font-mono font-bold">Total Forks</span>
                <GitFork className="w-4 h-4 text-[#0D0431]" />
              </div>
              <div className="text-2xl font-heading font-black text-[#0D0431]">
                {profile.totalForks || 0}
              </div>
            </div>
          </div>

          {/* 3. Top Languages Breakdown */}
          {languagesList.length > 0 && (
            <div className="bg-white border-2 border-[#0D0431] rounded-2xl p-5 space-y-3.5 shadow-[4px_4px_0_0_#0D0431]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#0D0431]" />
                  <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#0D0431]">
                    Language Distribution
                  </h4>
                </div>
              </div>

              {/* Multi-segment Colored Bar */}
              <div className="w-full h-3.5 bg-[#FEF9CF] rounded-full overflow-hidden flex border-2 border-[#0D0431]">
                {languagesList.slice(0, 7).map((lang, idx) => {
                  const color = LANGUAGE_COLORS[lang.languageName] || "#896EE2";
                  return (
                    <div
                      key={idx}
                      style={{ width: `${lang.percentage}%`, backgroundColor: color }}
                      className="h-full transition-all duration-500 border-r border-[#0D0431]"
                      title={`${lang.languageName}: ${lang.percentage}% (${lang.repoCount} repos)`}
                    />
                  );
                })}
              </div>

              {/* Language Pill Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {languagesList.map((lang, idx) => {
                  const color = LANGUAGE_COLORS[lang.languageName] || "#896EE2";
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7EE] border-2 border-[#0D0431] text-xs font-mono font-bold text-[#0D0431] shadow-[1px_1px_0_0_#0D0431]"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-[#0D0431]"
                        style={{ backgroundColor: color }}
                      />
                      <span>{lang.languageName}</span>
                      <span className="text-[#0D0431]/70 text-[11px]">
                        {lang.percentage}% ({lang.repoCount})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Tab Switcher */}
          <div className="flex items-center gap-2.5 border-b-2 border-[#0D0431] pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("featured")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono border-2 border-[#0D0431] transition-all cursor-pointer ${
                activeTab === "featured"
                  ? "bg-[#FEDF6A] text-[#0D0431] shadow-[3px_3px_0_0_#0D0431]"
                  : "bg-white text-[#0D0431] hover:bg-[#FEF9CF] shadow-[2px_2px_0_0_#0D0431]"
              }`}
            >
              <Star className="w-3.5 h-3.5 text-[#0D0431]" />
              <span>Featured Repositories ({topReposList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono border-2 border-[#0D0431] transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#FEDF6A] text-[#0D0431] shadow-[3px_3px_0_0_#0D0431]"
                  : "bg-white text-[#0D0431] hover:bg-[#FEF9CF] shadow-[2px_2px_0_0_#0D0431]"
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-[#0D0431]" />
              <span>All Repositories ({repositories.length})</span>
            </button>
          </div>

          {/* Tab 1: Featured Repositories Grid */}
          {activeTab === "featured" && (
            <div className="space-y-4">
              {topReposList.length === 0 ? (
                <div className="text-center py-10 bg-[#FEF9CF] rounded-2xl border-2 border-[#0D0431] text-[#0D0431] text-xs font-mono font-bold">
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
              <div className="bg-[#FEF9CF] border-2 border-[#0D0431] p-4 rounded-2xl space-y-3 shadow-[3px_3px_0_0_#0D0431]">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#0D0431]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search repositories..."
                      className="w-full pl-10 pr-4 py-2 bg-white text-[#0D0431] placeholder-[#0D0431]/40 border-2 border-[#0D0431] rounded-xl text-xs font-mono font-bold shadow-[2px_2px_0_0_#0D0431] focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#0D0431] hover:text-[#896EE2] p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Language Filter */}
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-white border-2 border-[#0D0431] rounded-xl text-xs font-mono font-bold text-[#0D0431] px-3 py-2 shadow-[2px_2px_0_0_#0D0431] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Languages</option>
                    {languagesList.map((lang) => (
                      <option key={lang.languageName} value={lang.languageName}>
                        {lang.languageName} ({lang.repoCount})
                      </option>
                    ))}
                  </select>

                  {/* Type Filter */}
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="bg-white border-2 border-[#0D0431] rounded-xl text-xs font-mono font-bold text-[#0D0431] px-3 py-2 shadow-[2px_2px_0_0_#0D0431] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="original">Original Only</option>
                    <option value="fork">Forks Only</option>
                  </select>

                  {/* Sort Filter */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border-2 border-[#0D0431] rounded-xl text-xs font-mono font-bold text-[#0D0431] px-3 py-2 shadow-[2px_2px_0_0_#0D0431] focus:outline-none cursor-pointer"
                  >
                    <option value="stars">Sort: Most Stars</option>
                    <option value="updated">Sort: Recently Updated</option>
                    <option value="pushed">Sort: Recently Pushed</option>
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="size">Sort: Codebase Size</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#0D0431]/70 font-mono font-bold pt-1 border-t border-[#0D0431]/20">
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
                      className="text-[#0D0431] underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>

              {/* Filtered Repos Grid */}
              {filteredRepositories.length === 0 ? (
                <div className="text-center py-12 bg-[#FAF7EE] rounded-2xl border-2 border-[#0D0431] text-[#0D0431] text-xs font-mono font-bold space-y-2">
                  <p>No repositories matched your filters.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedLanguage("all");
                      setSelectedType("all");
                    }}
                    className="text-[#0D0431] underline cursor-pointer font-bold"
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

      {/* Progressive Project Detail Modal */}
      {selectedRepoModal && (
        <div
          onClick={() => setSelectedRepoModal(null)}
          className="fixed inset-0 bg-[#0D0431]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FEF9CF] border-2 border-[#0D0431] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-[8px_8px_0_0_#0D0431] relative"
          >
            <div className="flex items-start justify-between border-b-2 border-[#0D0431] pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-[#0D0431]" />
                  <h3 className="text-base font-heading font-black text-[#0D0431]">
                    {selectedRepoModal.name}
                  </h3>
                  {selectedRepoModal.isFork && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#0D0431] border border-[#0D0431] font-mono font-bold">
                      Fork
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#0D0431]/80 font-medium">
                  {selectedRepoModal.description || "Production repository codebase."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRepoModal(null)}
                className="w-8 h-8 rounded-xl border-2 border-[#0D0431] bg-white hover:bg-[#FEDF6A] flex items-center justify-center text-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono font-bold">
              <div className="p-3 bg-white rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                <span className="text-[10px] text-[#0D0431]/60 uppercase block">Language</span>
                <span className="font-bold text-[#0D0431]">{selectedRepoModal.language || "TypeScript"}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                <span className="text-[10px] text-[#0D0431]/60 uppercase block">Stars</span>
                <span className="font-bold text-[#0D0431]">{selectedRepoModal.stars || 0}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                <span className="text-[10px] text-[#0D0431]/60 uppercase block">Forks</span>
                <span className="font-bold text-[#0D0431]">{selectedRepoModal.forks || 0}</span>
              </div>
            </div>

            {/* Architecture Verdict */}
            <div className="p-4 bg-white border-2 border-[#0D0431] rounded-2xl space-y-1 text-xs shadow-[2px_2px_0_0_#0D0431]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#896EE2] font-black block">
                Repository Assessment
              </span>
              <p className="text-[#0D0431] font-medium leading-relaxed text-xs">
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
                <span className="text-[10px] font-mono uppercase font-bold text-[#0D0431]/70 block">Topics</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRepoModal.topics.map((t, i) => (
                    <span key={i} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-[#0D0431] border border-[#0D0431] font-mono font-bold">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t-2 border-[#0D0431] flex items-center justify-between gap-3">
              {selectedRepoModal.hasLiveDemo && selectedRepoModal.liveDemoUrl && (
                <a
                  href={selectedRepoModal.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-xs font-bold font-mono text-center flex items-center justify-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Open Live Demo</span>
                </a>
              )}
              <a
                href={selectedRepoModal.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-white hover:bg-[#E4CDFB] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-[#0D0431] text-xs font-bold font-mono text-center flex items-center justify-center gap-1.5"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RepositoryCard({ repo, onSelectRepo }) {
  const langColor = LANGUAGE_COLORS[repo.language] || "#896EE2";

  return (
    <div className="bg-[#FAF7EE] hover:bg-white border-2 border-[#0D0431] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 transition-all shadow-[3px_3px_0_0_#0D0431] hover:shadow-[5px_5px_0_0_#0D0431] group">
      <div className="space-y-2">
        {/* Title & Badges Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <FolderGit2 className="w-4 h-4 text-[#0D0431] shrink-0" />
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[#0D0431] hover:text-[#896EE2] truncate font-heading flex items-center gap-1 group-hover:underline"
            >
              <span>{repo.name}</span>
              <ExternalLink className="w-3 h-3 text-[#0D0431]/60" />
            </a>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px] font-bold">
            {repo.isFork && (
              <span className="px-2 py-0.5 rounded-full bg-white text-[#0D0431] border border-[#0D0431]">
                Fork
              </span>
            )}
            {repo.isArchived && (
              <span className="px-2 py-0.5 rounded-full bg-white text-[#0D0431] border border-[#0D0431]">
                Archived
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#0D0431]/80 line-clamp-2 leading-relaxed font-medium">
          {repo.description || <span className="italic opacity-60">No description provided.</span>}
        </p>

        {/* Topics Pills */}
        {Array.isArray(repo.topics) && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {repo.topics.slice(0, 4).map((topic, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#0D0431] border border-[#0D0431] font-mono font-bold"
              >
                #{topic}
              </span>
            ))}
            {repo.topics.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E4CDFB] text-[#0D0431] border border-[#0D0431] font-mono font-bold">
                +{repo.topics.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-3 border-t-2 border-[#0D0431]/20 flex items-center justify-between text-xs font-mono font-bold">
        <div className="flex items-center gap-3 text-[#0D0431]">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full border border-[#0D0431]"
                style={{ backgroundColor: langColor }}
              />
              <span>{repo.language}</span>
            </span>
          )}

          <span className="flex items-center gap-1" title={`${repo.stars} stars`}>
            <Star className="w-3.5 h-3.5 text-[#0D0431] fill-[#FEDF6A]" />
            <span>{repo.stars || 0}</span>
          </span>

          {repo.forks > 0 && (
            <span className="flex items-center gap-1" title={`${repo.forks} forks`}>
              <GitFork className="w-3.5 h-3.5 text-[#0D0431]" />
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
              className="text-[#0D0431] hover:bg-[#FEDF6A] text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-[#0D0431] bg-white transition-all shadow-[1px_1px_0_0_#0D0431] cursor-pointer"
            >
              Details
            </button>
          )}

          {repo.hasLiveDemo && repo.liveDemoUrl && (
            <a
              href={repo.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D4FDF7] hover:bg-white text-[#0D0431] border border-[#0D0431] text-[11px] font-bold transition-all shadow-[1px_1px_0_0_#0D0431] cursor-pointer"
            >
              <Globe className="w-3 h-3" />
              <span>Demo</span>
            </a>
          )}

          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#E4CDFB] text-[#0D0431] border border-[#0D0431] text-[11px] font-bold transition-all shadow-[1px_1px_0_0_#0D0431] cursor-pointer"
          >
            <span>Code</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
