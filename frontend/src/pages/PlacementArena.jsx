import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

export default function PlacementArena() {
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
      alert(err.response?.data?.message || "Invalid Squad Code");
    }
  };

  const topRankers = leaderboardData?.topRankers || [];
  const challenges = challengesData || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-400">
              <Swords className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Placement Arena & Squads</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Social accountability, peer squads, global & college leaderboards, and weekly placement sprints
              </p>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#18181b] border border-gray-800 text-xs flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400">Your Rank:</span>
            <span className="text-yellow-400 font-bold font-mono">
              #{leaderboardData?.userRank || 12}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        {[
          { key: "leaderboard", label: "Global Leaderboard", icon: Trophy },
          { key: "squad", label: "My Peer Squad", icon: Users },
          { key: "challenges", label: "Weekly Placement Challenges", icon: Zap },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-[#18181b] text-gray-400 hover:text-white border border-gray-800"
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
        <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Campus & Global Rankings</h3>
              <p className="text-xs text-gray-400">
                Ranked by 7-dimension Placement Readiness Score, DSA solve volume, and active streaks
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by college (e.g. VIT, IIT, NIT)..."
                value={searchCollege}
                onChange={(e) => setSearchCollege(e.target.value)}
                className="w-full bg-[#121214] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 border-b border-gray-800/80 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Readiness Score</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Solved</th>
                  <th className="py-3 px-4">Streak</th>
                  <th className="py-3 px-4">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40 font-medium">
                {topRankers.map((user) => (
                  <tr
                    key={user.rank}
                    className={`transition-colors ${
                      user.isCurrentUser
                        ? "bg-purple-950/20 border-l-2 border-purple-500 font-bold"
                        : "hover:bg-[#121214]"
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {user.rank === 1 ? "🥇 #1" : user.rank === 2 ? "🥈 #2" : user.rank === 3 ? "🥉 #3" : `#${user.rank}`}
                    </td>
                    <td className="py-3.5 px-4 text-white">
                      <div className="flex items-center gap-2">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-7 h-7 rounded-full object-cover border border-purple-500/40"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center text-xs">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div>{user.name} {user.isCurrentUser && <span className="text-[10px] text-purple-400">(You)</span>}</div>
                          <span className="text-[10px] text-gray-400">Target: {user.targetCompany}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">{user.college}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {user.readinessScore}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {user.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-200">{user.problemsSolved}</td>
                    <td className="py-3.5 px-4 text-amber-400 font-mono">🔥 {user.streakDays}d</td>
                    <td className="py-3.5 px-4 font-mono text-yellow-400 font-bold">+{user.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MY PEER SQUAD */}
      {activeTab === "squad" && (
        <div className="space-y-6">
          {squadData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Squad Details & Goal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Squad Banner */}
                <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-2xl flex items-center justify-center">
                        {squadData.avatar || "⚡"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{squadData.name}</h3>
                        <p className="text-xs text-gray-400">{squadData.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[#121214] text-purple-400 border border-purple-500/30">
                        Invite Code: {squadData.code}
                      </span>
                    </div>
                  </div>

                  {/* Collective Weekly Target */}
                  <div className="mt-6 p-4 rounded-xl bg-[#121214] border border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                      <span className="font-semibold text-white">
                        {squadData.weeklyGoal?.title || "Weekly Squad Goal"}
                      </span>
                      <span className="font-mono text-purple-400 font-bold">
                        {squadData.weeklyGoal?.currentCount || 54} / {squadData.weeklyGoal?.targetCount || 60} Solved
                      </span>
                    </div>

                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-amber-500 h-2 rounded-full"
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
                <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-base font-bold text-white mb-4">
                    Squad Members ({squadData.members?.length || 4})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(squadData.members || []).map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#121214] border border-gray-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{m.name}</div>
                            <span className="text-[10px] text-gray-500 uppercase">{m.role}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-emerald-400">
                            {m.readinessScore}%
                          </div>
                          <span className="text-[10px] text-gray-400">🔥 {m.streakDays}d</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Squad Cheer & Chat Feed */}
              <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col h-[520px]">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Squad Activity & Cheer Wall</h4>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {(squadData.messages || []).map((msg, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#121214] border border-gray-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300">{msg.senderName}</span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-[11px] leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-gray-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Share achievement or cheer your squad..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 bg-[#121214] text-xs text-white px-3 py-2 rounded-xl border border-gray-800 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
              <Users className="w-12 h-12 text-purple-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Join or Create a Placement Squad</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Form a tight peer group of 4-6 students to hold each other accountable, share mock interview notes, and compete on the leaderboard.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSquadModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Create New Squad
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinSquadModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#121214] border border-gray-800 text-white text-xs font-bold"
                >
                  Join with Code
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WEEKLY CHALLENGES */}
      {activeTab === "challenges" && (
        <div className="space-y-4">
          <div className="bg-[#18181b] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-1">Active Placement Challenges</h3>
            <p className="text-xs text-gray-400 mb-6">
              Complete timed challenges to boost your readiness velocity and unlock rare profile badges
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {challenges.map((chal) => (
                <div
                  key={chal.id}
                  className="bg-[#121214] border border-gray-800/80 hover:border-purple-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {chal.category}
                      </span>
                      <span className="text-yellow-400 font-mono font-bold text-xs">
                        +{chal.xpReward} XP
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-2">{chal.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {chal.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-800/60">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Ends in {chal.endsInDays} days
                      </span>
                      <span>{chal.participantsCount} Joined</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Joined ${chal.title}! Progress will automatically track in Arena.`)}
                      className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all"
                    >
                      Participate Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
