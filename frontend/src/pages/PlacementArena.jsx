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
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

export default function PlacementArena() {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("leaderboard");
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
      if (!loading) {
        gsap.fromTo(
          ".gsap-fade-item",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
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

  const handleJoinChallenge = (chalId) => {
    setJoinedChallenges((prev) => ({ ...prev, [chalId]: true }));
  };

  const topRankers = leaderboardData?.topRankers || [];
  const challenges = challengesData || [];

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-white">
      <div ref={containerRef} className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        {/* Editorial Wide Header */}
        <header className="gsap-fade-item flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono uppercase tracking-widest">
              <Swords className="w-3.5 h-3.5" />
              Competitive Readiness League
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Placement Arena & Squad Battles
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
              Campus and national leaderboards, collaborative peer study squads, and weekly sprint challenges.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs flex items-center gap-2 shadow-lg">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-zinc-400 font-mono">Current Standing:</span>
              <span className="text-yellow-300 font-bold font-mono text-sm">
                Rank #{leaderboardData?.userRank || 12}
              </span>
            </div>
          </div>
        </header>

        {/* Tab Navigation Pill Bar */}
        <div className="gsap-fade-item flex items-center gap-2 border-b border-white/10 pb-4">
          {[
            { key: "leaderboard", label: "National & Campus Leaderboard", icon: Trophy },
            { key: "squad", label: "Peer Accountability Squad", icon: Users },
            { key: "challenges", label: "Weekly Sprint Challenges", icon: Zap },
          ].map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-white text-zinc-950 shadow-md"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/10"
                }`}
              >
                <IconComp className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <section className="gsap-fade-item rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Verified Candidate Rankings
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Evaluated across composite 7-dimension readiness index, verified LeetCode solves, and streak momentum
                </p>
              </div>

              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by college (VIT, IIT, NIT, BITS)..."
                  value={searchCollege}
                  onChange={(e) => setSearchCollege(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-400 border-b border-white/10 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Institution</th>
                    <th className="py-3 px-4">Readiness Index</th>
                    <th className="py-3 px-4">Standing Tier</th>
                    <th className="py-3 px-4">Problems Solved</th>
                    <th className="py-3 px-4">Active Streak</th>
                    <th className="py-3 px-4">Placement XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {topRankers.map((user) => (
                    <tr
                      key={user.rank}
                      className={`transition-colors duration-150 ${
                        user.isCurrentUser
                          ? "bg-purple-950/30 border-l-2 border-purple-400 font-bold"
                          : "hover:bg-zinc-950/60"
                      }`}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        {user.rank === 1 ? (
                          <span className="inline-flex items-center gap-1 text-yellow-400">
                            <Award className="w-4 h-4" /> #1
                          </span>
                        ) : user.rank === 2 ? (
                          <span className="inline-flex items-center gap-1 text-zinc-300">
                            <Medal className="w-4 h-4" /> #2
                          </span>
                        ) : user.rank === 3 ? (
                          <span className="inline-flex items-center gap-1 text-amber-500">
                            <Medal className="w-4 h-4" /> #3
                          </span>
                        ) : (
                          `#${user.rank}`
                        )}
                      </td>
                      <td className="py-4 px-4 text-white">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-purple-500/40"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs font-mono">
                              {user.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">
                              {user.name}{" "}
                              {user.isCurrentUser && (
                                <span className="text-[10px] font-mono text-purple-400">
                                  (You)
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Target: {user.targetCompany}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-zinc-300">{user.college}</td>
                      <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                        {user.readinessScore}%
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {user.tier}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-zinc-200">{user.problemsSolved}</td>
                      <td className="py-4 px-4 text-amber-400 font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" /> {user.streakDays}d
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-yellow-300 font-bold">
                        +{user.xp} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: MY PEER SQUAD */}
        {activeTab === "squad" && (
          <div className="space-y-6">
            {squadData ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Squad Details & Target */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Squad Banner */}
                  <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono font-extrabold text-xl flex items-center justify-center">
                          <Users className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">
                            {squadData.name}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-0.5">{squadData.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl bg-zinc-950 text-purple-300 border border-purple-500/30">
                          Invite Code: {squadData.code}
                        </span>
                      </div>
                    </div>

                    {/* Collective Weekly Target */}
                    <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-300">
                        <span className="font-semibold text-white">
                          {squadData.weeklyGoal?.title || "Weekly Collective Target"}
                        </span>
                        <span className="font-mono text-purple-400 font-bold">
                          {squadData.weeklyGoal?.currentCount || 54} /{" "}
                          {squadData.weeklyGoal?.targetCount || 60} Solved
                        </span>
                      </div>

                      <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                ((squadData.weeklyGoal?.currentCount || 54) /
                                  (squadData.weeklyGoal?.targetCount || 60)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Squad Members Roster */}
                  <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-4">
                    <h4 className="text-base font-bold text-white tracking-tight">
                      Active Squad Members ({squadData.members?.length || 4})
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {(squadData.members || []).map((m, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-zinc-950/80 border border-white/5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs font-mono">
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{m.name}</div>
                              <span className="text-[10px] text-zinc-500 font-mono uppercase">
                                {m.role}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-emerald-400">
                              {m.readinessScore}%
                            </div>
                            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5 justify-end">
                              <Flame className="w-3 h-3" /> {m.streakDays}d
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Squad Activity & Cheer Wall */}
                <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl flex flex-col h-[540px]">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      Squad Activity & Peer Cheer Wall
                    </h4>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {(squadData.messages || []).map((msg, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300">{msg.senderName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-xs leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="mt-4 pt-3 border-t border-white/10 flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Share progress or cheer squad..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1 bg-zinc-950 text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-12 text-center max-w-xl mx-auto space-y-5 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Join or Form a Placement Squad
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                  Build peer accountability groups of 4-6 candidates to share mock interviews, coordinate technical problem solving, and climb the campus leaderboard together.
                </p>
                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateSquadModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
                  >
                    Create New Squad
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJoinSquadModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-semibold text-xs hover:bg-zinc-900 transition-all cursor-pointer"
                  >
                    Join with Invite Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WEEKLY CHALLENGES */}
        {activeTab === "challenges" && (
          <div className="space-y-6">
            <section className="gsap-fade-item rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Active Placement Sprint Challenges
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Complete time-bounded sprint challenges to boost readiness index and unlock exclusive profile accolades
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {challenges.map((chal) => {
                  const isJoined = joinedChallenges[chal.id];
                  return (
                    <div
                      key={chal.id}
                      className="group bg-zinc-950/80 border border-white/10 hover:border-purple-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {chal.category}
                          </span>
                          <span className="text-yellow-300 font-mono font-bold text-xs">
                            +{chal.xpReward} XP
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white mb-2 tracking-tight group-hover:text-purple-300 transition-colors">
                          {chal.title}
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                          {chal.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-3">
                        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                          <span className="flex items-center gap-1.5 text-amber-400">
                            <Clock className="w-3.5 h-3.5" /> {chal.endsInDays} days left
                          </span>
                          <span>{chal.participantsCount + (isJoined ? 1 : 0)} joined</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleJoinChallenge(chal.id)}
                          className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            isJoined
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-white text-zinc-950 hover:bg-zinc-200 shadow-md active:scale-95"
                          }`}
                        >
                          {isJoined ? "Challenge Enrolled" : "Enroll in Sprint"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* Modal: Create Squad */}
        {showCreateSquadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white tracking-tight">Create Placement Squad</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateSquadModal(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSquad} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1.5">Squad Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAANG Apex Grinders"
                    value={newSquadName}
                    onChange={(e) => setNewSquadName(e.target.value)}
                    className="w-full bg-zinc-950 text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1.5">
                    Mission / Target
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aiming for Tier 1 product offers in campus drives"
                    value={newSquadDesc}
                    onChange={(e) => setNewSquadDesc(e.target.value)}
                    className="w-full bg-zinc-950 text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateSquadModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    Form Squad
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Join Squad */}
        {showJoinSquadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Join Existing Placement Squad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowJoinSquadModal(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleJoinSquad} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1.5">
                    Squad Invite Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-character code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-zinc-950 text-white text-sm font-mono rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-purple-400 uppercase"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowJoinSquadModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    Join Squad
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
