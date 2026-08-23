import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Trophy,
  Users,
  Flame,
  Swords,
  Crown,
  Search,
  MessageSquare,
  Send,
  Plus,
  ArrowRight,
  Shield,
  Zap,
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  Medal,
  X,
  Compass,
  Copy,
  Check,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";

export default function PlacementArena() {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("leaderboard"); // 'leaderboard' | 'squad' | 'challenges'
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [squadData, setSquadData] = useState(null);
  const [challengesData, setChallengesData] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [searchCollege, setSearchCollege] = useState("");
  const [showCreateSquadModal, setShowCreateSquadModal] = useState(false);
  const [showJoinSquadModal, setShowJoinSquadModal] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadDesc, setNewSquadDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinedChallenges, setJoinedChallenges] = useState({});
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchArenaData = async () => {
    try {
      const [lbRes, squadRes, chalRes] = await Promise.allSettled([
        axios.get(`${NODE_API_URL}/api/arena/leaderboard?college=${searchCollege}`, {
          withCredentials: true,
        }),
        axios.get(`${NODE_API_URL}/api/arena/squads/my-squad`, { withCredentials: true }),
        axios.get(`${NODE_API_URL}/api/arena/challenges`, { withCredentials: true }),
      ]);

      if (lbRes.status === "fulfilled" && lbRes.value?.data) {
        setLeaderboardData(lbRes.value.data);
      }
      if (squadRes.status === "fulfilled" && squadRes.value?.data) {
        setSquadData(squadRes.value.data);
      }
      if (chalRes.status === "fulfilled" && chalRes.value?.data) {
        setChallengesData(chalRes.value.data.challenges || []);
      }
    } catch (err) {
      console.warn("Could not load arena data from backend:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArenaData();
  }, [searchCollege]);

  useGSAP(
    () => {
      if (!loading && containerRef.current) {
        gsap.fromTo(
          containerRef.current.querySelectorAll(".arena-fade-item"),
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.out",
          }
        );
      }
    },
    { scope: containerRef, dependencies: [loading, activeTab] }
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/arena/squads/message`,
        { text: chatMessage, type: "chat" },
        { withCredentials: true }
      );
      if (res.data?.message) {
        setSquadData((prev) => ({
          ...prev,
          messages: [res.data.message, ...(prev.messages || [])],
        }));
        setChatMessage("");
      }
    } catch (err) {
      console.error("Could not post message:", err);
    }
  };

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/arena/squads/create`,
        { name: newSquadName, description: newSquadDesc },
        { withCredentials: true }
      );
      if (res.data) {
        setSquadData(res.data);
        setShowCreateSquadModal(false);
        setNewSquadName("");
      }
    } catch (err) {
      console.error("Could not create squad:", err);
    }
  };

  const handleJoinSquad = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/arena/squads/join`,
        { code: joinCode },
        { withCredentials: true }
      );
      if (res.data) {
        setSquadData(res.data);
        setShowJoinSquadModal(false);
        setJoinCode("");
      }
    } catch (err) {
      console.error("Could not join squad:", err);
    }
  };

  const handleJoinChallenge = async (chalId) => {
    try {
      await axios.post(
        `${NODE_API_URL}/api/arena/challenges/${chalId}/enroll`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.warn("Could not persist challenge enrollment:", err);
    }
    setJoinedChallenges((prev) => ({ ...prev, [chalId]: true }));
  };

  const topRankers = leaderboardData?.topRankers || [];
  const challenges = challengesData || [];
  const currentUserEntry = topRankers.find((u) => u.isCurrentUser);

  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2DEEC]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight flex items-center gap-2.5">
            <Swords className="w-6 h-6 text-[#6E44FF]" />
            <span>Placement Arena</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6A80] mt-1">
            Compare benchmark scores, compete in weekly coding squads, and track peer standing.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex items-center p-1 bg-white border border-[#E2DEEC] rounded-xl shadow-sm self-start text-xs font-semibold">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-[#17103D] text-white shadow-sm"
                : "text-[#6F6A80] hover:text-[#17103D]"
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("squad")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "squad"
                ? "bg-[#17103D] text-white shadow-sm"
                : "text-[#6F6A80] hover:text-[#17103D]"
            }`}
          >
            My Squad
          </button>
          <button
            onClick={() => setActiveTab("challenges")}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "challenges"
                ? "bg-[#17103D] text-white shadow-sm"
                : "text-[#6F6A80] hover:text-[#17103D]"
            }`}
          >
            Challenges
          </button>
        </div>
      </div>

      {/* Personal Compact Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Your Rank
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#17103D] flex items-baseline gap-1">
            <span>#{currentUserEntry?.rank ? currentUserEntry.rank : "–"}</span>
            <span className="text-xs font-medium text-[#6F6A80]">/ {leaderboardData?.totalParticipants || topRankers.length || "–"}</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Readiness Score
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#6E44FF]">
            {currentUserEntry?.readinessScore !== undefined && currentUserEntry?.readinessScore !== null ? `${currentUserEntry.readinessScore}%` : "–"}
          </div>
        </div>

        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Problems Solved
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#17103D]">
            {currentUserEntry?.problemsSolved ?? 0}
          </div>
        </div>

        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Active Streak
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#9E6700] flex items-center gap-1">
            <Flame className="w-4 h-4 text-[#FFD84D] fill-[#FFD84D]" />
            <span>{currentUserEntry?.streakDays ?? currentUserEntry?.streak ?? 0}d</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-[#E2DEEC] rounded-2xl p-4 shadow-[0_2px_8px_rgba(23,16,61,0.02)] space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
            Target Company
          </span>
          <div className="text-sm font-bold text-[#17103D] truncate">
            {currentUserEntry?.targetCompany || currentUserEntry?.targetJobRole || "Tier 1 Tech"}
          </div>
        </div>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-[#E2DEEC] rounded-2xl p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6A80]" />
              <input
                type="text"
                value={searchCollege}
                onChange={(e) => setSearchCollege(e.target.value)}
                placeholder="Filter by university (e.g. VIT)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl focus:outline-none focus:border-[#6E44FF]"
              />
            </div>

            <span className="text-xs text-[#6F6A80] font-medium self-end sm:self-center">
              Showing top rankers & your cohort standing
            </span>
          </div>

          {/* Clean Leaderboard Table */}
          <div className="bg-white border border-[#E2DEEC] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(23,16,61,0.03)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F8F5] text-[#6F6A80] font-semibold uppercase tracking-wider text-[11px] border-b border-[#E2DEEC]">
                    <th className="py-3 px-4 w-16">Rank</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">College</th>
                    <th className="py-3 px-4">Target Role</th>
                    <th className="py-3 px-4 text-center">Problems</th>
                    <th className="py-3 px-4 text-center">Streak</th>
                    <th className="py-3 px-4 text-right">Readiness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DEEC]">
                  {topRankers.map((ranker, idx) => {
                    const isSelf = ranker.isCurrentUser;
                    const rank = ranker.rank || idx + 1;
                    const rankerStreak = ranker.streakDays ?? ranker.streak;

                    return (
                      <tr
                        key={ranker.userId || idx}
                        className={`transition-colors ${
                          isSelf
                            ? "bg-[#FEF6D6]/40 font-bold text-[#17103D]"
                            : "hover:bg-[#F8F8F5]/60 text-[#17103D]"
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold">
                          {rank === 1 ? (
                            <span className="inline-flex items-center gap-1 text-[#9E6700]">
                              <Crown className="w-4 h-4 fill-[#FFD84D]" /> 1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center gap-1 text-[#6F6A80]">
                              <Medal className="w-3.5 h-3.5" /> 2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center gap-1 text-[#9E6700]">
                              <Medal className="w-3.5 h-3.5" /> 3
                            </span>
                          ) : (
                            `#${rank}`
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{ranker.name}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFD84D] text-[#17103D] font-bold">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#6F6A80] truncate max-w-[140px]">
                          {ranker.college || "VIT Chennai"}
                        </td>
                        <td className="py-3 px-4 text-[#6F6A80] truncate max-w-[150px]">
                          {ranker.targetCompany || ranker.targetJobRole || "Tier 1 Tech"}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {ranker.problemsSolved ?? 0}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#9E6700]">
                          {rankerStreak ? `${rankerStreak}d` : "–"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#6E44FF]">
                          {ranker.readinessScore ?? 0}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY SQUAD */}
      {activeTab === "squad" && (
        !squadData ? (
          <div className="bg-white border border-[#E2DEEC] rounded-2xl p-8 sm:p-10 shadow-sm text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F2F0FA] text-[#6E44FF] flex items-center justify-center mx-auto shadow-sm">
              <Users className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#17103D]">No Squad Yet</h3>
              <p className="text-xs text-[#6F6A80] max-w-md mx-auto leading-relaxed">
                Join a peer study squad or create your own to share milestones, solve DSA challenges collaboratively, and cheer on each other's placement journey.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowCreateSquadModal(true)}
                className="px-4 py-2 rounded-xl border border-[#E2DEEC] hover:bg-[#F2F0FA] text-xs font-bold text-[#17103D] transition-colors cursor-pointer"
              >
                Create Squad
              </button>
              <button
                onClick={() => setShowJoinSquadModal(true)}
                className="px-4 py-2 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-xs font-bold text-white transition-colors cursor-pointer shadow-sm"
              >
                Join with Code
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Squad Details & Members */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DEEC]">
                  <div>
                    <h3 className="text-base font-bold text-[#17103D] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#6E44FF]" />
                      <span>{squadData.name}</span>
                    </h3>
                    <p className="text-xs text-[#6F6A80] mt-0.5">
                      {squadData.description || "Collaborative peer group practicing DSA daily."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {squadData.code && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(squadData.code);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF6D6] hover:bg-[#FEDF6A] text-xs font-mono font-bold text-[#9E6700] border border-[#FFD84D] transition-colors cursor-pointer shadow-sm"
                        title="Click to copy squad invite code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-[#0D7A68]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? "Copied!" : `Code: ${squadData.code}`}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowCreateSquadModal(true)}
                      className="px-3 py-1.5 rounded-xl border border-[#E2DEEC] hover:bg-[#F2F0FA] text-xs font-semibold text-[#17103D] transition-colors cursor-pointer"
                    >
                      Create Squad
                    </button>
                    <button
                      onClick={() => setShowJoinSquadModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Join Code
                    </button>
                  </div>
                </div>

                {/* Members Grid */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A80]">
                    Squad Members ({squadData.members?.length || 0})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(squadData.members || []).map((m, i) => (
                      <div
                        key={m.userId || i}
                        className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-white border border-[#E2DEEC] flex items-center justify-center font-bold text-xs text-[#17103D]">
                            {(m.name || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="text-xs font-medium text-[#17103D] truncate">
                            {m.name || "Member"}
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#6E44FF]">
                          {m.readinessScore !== undefined && m.readinessScore !== null ? `${m.readinessScore}%` : (m.score || "–")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Squad Live Discussion */}
            <div className="bg-white border border-[#E2DEEC] rounded-2xl p-4 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#E2DEEC]">
                <MessageSquare className="w-4 h-4 text-[#6F6A80]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#17103D]">
                  Squad Chat
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2 text-xs">
                {(squadData.messages || []).length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6F6A80]">
                    No messages in squad chat yet. Say hello to your squad!
                  </div>
                ) : (
                  (squadData.messages || []).map((msg, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-[#F8F8F5] space-y-0.5">
                      <span className="font-bold text-[#17103D]">
                        {msg.senderName || msg.user || msg.sender || "Squad Member"}:{" "}
                      </span>
                      <span className="text-[#6F6A80]">{msg.text}</span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="pt-2 border-t border-[#E2DEEC] flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Message squad..."
                  className="flex-1 bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-1.5 text-xs text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#17103D] text-white hover:bg-[#24195A] transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )
      )}

      {/* TAB 3: CHALLENGES */}
      {activeTab === "challenges" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(challenges.length > 0
            ? challenges
            : [
                {
                  id: "chal-1",
                  title: "Blind 75 Sprint",
                  description: "Solve 10 Array & Matrix problems within 7 days.",
                  xpReward: 250,
                  endsInDays: 3,
                  participantsCount: 84,
                },
                {
                  id: "chal-2",
                  title: "Graph Traversal Marathon",
                  description: "Master DFS, BFS, and Dijkstra on medium-tier graphs.",
                  xpReward: 400,
                  endsInDays: 5,
                  participantsCount: 62,
                },
                {
                  id: "chal-3",
                  title: "DP Tabulation Challenge",
                  description: "Solve 6 standard 0/1 Knapsack & LCS problems.",
                  xpReward: 500,
                  endsInDays: 6,
                  participantsCount: 41,
                },
              ]
          ).map((chal) => (
            <div
              key={chal.id}
              className="bg-white border border-[#E2DEEC] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#C8C3D8] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <GpBadge theme="mint" size="sm">
                    +{chal.xpReward || chal.xp || 0} XP
                  </GpBadge>
                  <span className="text-[11px] font-mono text-[#6F6A80] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {chal.endsInDays ? `${chal.endsInDays} days left` : chal.deadline || "Active"}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#17103D]">{chal.title}</h4>
                <p className="text-xs text-[#6F6A80] leading-relaxed">{chal.description || chal.desc}</p>
              </div>

              <div className="pt-3 border-t border-[#E2DEEC] flex items-center justify-between">
                <span className="text-[11px] text-[#6F6A80]">
                  {(chal.participantsCount ?? chal.participants) || 0} candidates enrolled
                </span>

                <button
                  onClick={() => handleJoinChallenge(chal.id)}
                  disabled={joinedChallenges[chal.id]}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    joinedChallenges[chal.id]
                      ? "bg-[#D8FAF4] text-[#0D7A68] border border-[#B7F4E8]"
                      : "bg-[#17103D] hover:bg-[#24195A] text-white shadow-sm"
                  }`}
                >
                  {joinedChallenges[chal.id] ? "Enrolled" : "Enroll Challenge"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Squad */}
      {showCreateSquadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17103D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 border border-[#E2DEEC] max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DEEC]">
              <h3 className="text-sm font-bold text-[#17103D]">Create Peer Squad</h3>
              <button onClick={() => setShowCreateSquadModal(false)} className="text-[#6F6A80] hover:text-[#17103D]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSquad} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#6F6A80] mb-1">Squad Name</label>
                <input
                  type="text"
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  placeholder="e.g. SDE Grinders"
                  required
                  className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-2 text-sm text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#6F6A80] mb-1">Description</label>
                <input
                  type="text"
                  value={newSquadDesc}
                  onChange={(e) => setNewSquadDesc(e.target.value)}
                  placeholder="Target goals & prep focus"
                  className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-2 text-sm text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSquadModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#E2DEEC] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#17103D] text-white text-xs font-bold hover:bg-[#24195A]"
                >
                  Create Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Squad */}
      {showJoinSquadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17103D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 border border-[#E2DEEC] max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DEEC]">
              <h3 className="text-sm font-bold text-[#17103D]">Join Squad</h3>
              <button onClick={() => setShowJoinSquadModal(false)} className="text-[#6F6A80] hover:text-[#17103D]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleJoinSquad} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#6F6A80] mb-1">Squad Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter 6-digit squad code"
                  required
                  className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3 py-2 text-sm font-mono text-[#17103D] focus:outline-none focus:border-[#6E44FF]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoinSquadModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#E2DEEC] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#17103D] text-white text-xs font-bold hover:bg-[#24195A]"
                >
                  Join Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
