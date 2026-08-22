import mongoose from "mongoose";
import Squad from "../models/squadModel.js";
import User from "../models/userModel.js";
import Progress from "../models/progressModel.js";

export const ACTIVE_WEEKLY_CHALLENGES = [
  {
    id: "chal-dp-sprint",
    title: "Sprint: 5 Medium Dynamic Programming Problems",
    description: "Solve 5 DP questions (0/1 Knapsack, Coin Change, LCS, Longest Palindrome, Edit Distance) before Sunday midnight.",
    category: "dsa",
    xpReward: 300,
    targetCount: 5,
    unit: "problems",
    badgeReward: "DP Sprint Ace",
    icon: "Cpu",
    endsInDays: 4,
    participantsCount: 342,
  },
  {
    id: "chal-ats-polish",
    title: "ATS Polish: Achieve 85%+ AI Resume ATS Score",
    description: "Analyze and tune your resume with high-impact action verbs and job description keywords to unlock the ATS Benchmark badge.",
    category: "resume",
    xpReward: 200,
    targetCount: 1,
    unit: "audit",
    badgeReward: "ATS Terminator",
    icon: "FileCheck",
    endsInDays: 5,
    participantsCount: 289,
  },
  {
    id: "chal-study-streak",
    title: "Consistency Sprint: 5-Day Practice Streak",
    description: "Log at least 30 minutes of study or problem solving every day for 5 consecutive days.",
    category: "streak",
    xpReward: 250,
    targetCount: 5,
    unit: "days",
    badgeReward: "Streak Machine",
    icon: "Flame",
    endsInDays: 3,
    participantsCount: 512,
  },
];

export async function getArenaLeaderboard(userId, user = null, collegeFilter = "all") {
  const filterQuery = {};
  if (collegeFilter && collegeFilter !== "all") {
    filterQuery.college = new RegExp(collegeFilter, "i");
  }

  let users = [];
  let progressList = [];

  if (mongoose.connection?.readyState === 1) {
    try {
      users = await User.find(filterQuery)
        .select("name college targetCompany avatar readinessScore cgpa skills")
        .lean();
      const userIds = users.map((u) => u._id);
      progressList = await Progress.find({ userId: { $in: userIds } }).lean();
    } catch (err) {
      console.warn("Could not query users/progress for leaderboard:", err.message);
    }
  }

  const progressMap = new Map(progressList.map((p) => [String(p.userId), p]));

  let leaderboardEntries = users.map((u) => {
    const userProgress = progressMap.get(String(u._id));
    const readinessScore = u.readinessScore || 0;
    const streakDays = userProgress?.dailyStreak || 0;
    const problemsSolved = userProgress?.totalProblemsSolved || 0;
    const xp = problemsSolved * 20 + streakDays * 15;

    let tier = "Bronze";
    if (readinessScore >= 90) tier = "Diamond";
    else if (readinessScore >= 80) tier = "Platinum";
    else if (readinessScore >= 70) tier = "Gold";
    else if (readinessScore >= 60) tier = "Silver";

    return {
      userId: u._id,
      name: u.name || "Candidate",
      college: u.college || "Unspecified College",
      readinessScore,
      tier,
      problemsSolved,
      streakDays,
      avatar: u.avatar || "",
      targetCompany: u.targetCompany || "Tier 1 Tech",
      xp,
      isCurrentUser: Boolean(userId && String(u._id) === String(userId)),
    };
  });

  leaderboardEntries.sort((a, b) => b.readinessScore - a.readinessScore || b.xp - a.xp);
  leaderboardEntries.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  const currentUserEntry = leaderboardEntries.find((u) => u.isCurrentUser);

  return {
    totalParticipants: leaderboardEntries.length,
    userRank: currentUserEntry ? currentUserEntry.rank : null,
    topRankers: leaderboardEntries,
  };
}

export async function getUserSquad(userId, user = null) {
  let squad = await Squad.findOne({ "members.userId": userId });

  if (!squad) {
    return null;
  }

  const totalReadiness = squad.members.reduce((acc, m) => acc + (m.readinessScore || 0), 0);
  squad.aggregateReadiness = Math.round(totalReadiness / (squad.members.length || 1));

  return squad;
}

export async function postSquadMessage(userId, userName, text, type = "chat") {
  const squad = await Squad.findOne({ "members.userId": userId });
  if (!squad) {
    throw new Error("You are not part of any squad yet. Create or join one first.");
  }

  const newMsg = {
    senderId: userId,
    senderName: userName || "Candidate",
    text,
    type,
    createdAt: new Date(),
  };

  squad.messages.unshift(newMsg);
  await squad.save();

  return { success: true, message: newMsg };
}

export async function joinSquadByCode(userId, userName, code) {
  const squad = await Squad.findOne({ code: code.trim().toUpperCase() });
  if (!squad) {
    throw new Error("Invalid Squad Code. Please check and try again.");
  }

  const isAlreadyMember = squad.members.some((m) => m.userId.toString() === userId.toString());
  if (isAlreadyMember) {
    return squad;
  }

  squad.members.push({
    userId,
    name: userName || "Candidate",
    role: "member",
    joinedAt: new Date(),
    weeklyContribution: 0,
    readinessScore: 75,
    streakDays: 1,
  });

  squad.messages.unshift({
    senderId: userId,
    senderName: "System",
    text: `${userName || "Candidate"} joined the squad! Welcome aboard! 🎉`,
    type: "system",
    createdAt: new Date(),
  });

  await squad.save();
  return squad;
}

export async function createSquad(userId, userName, squadData) {
  const code = (squadData.name.replace(/[^A-Z0-9]/gi, "").slice(0, 5) + Math.floor(1000 + Math.random() * 9000)).toUpperCase();

  const newSquad = await Squad.create({
    name: squadData.name,
    code,
    description: squadData.description || "Campus placement peer group.",
    avatar: squadData.avatar || "🚀",
    targetTier: squadData.targetTier || "Tier 1 Product Companies",
    creatorId: userId,
    members: [
      {
        userId,
        name: userName || "Leader",
        role: "leader",
        joinedAt: new Date(),
        weeklyContribution: 0,
        readinessScore: 80,
        streakDays: 1,
      },
    ],
    weeklyGoal: {
      title: "Collective Target: 40 Problems Solved",
      targetCount: 40,
      currentCount: 0,
      endsAt: new Date(Date.now() + 7 * 86400000),
    },
    messages: [
      {
        senderId: userId,
        senderName: "System",
        text: `Squad ${squadData.name} created! Invite your friends using code: ${code}`,
        type: "system",
        createdAt: new Date(),
      },
    ],
    aggregateReadiness: 80,
  });

  return newSquad;
}
