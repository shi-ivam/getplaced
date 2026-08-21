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

export const DUMMY_LEADERBOARD_USERS = [
  {
    rank: 1,
    name: "Aarav Sharma",
    college: "IIT Bombay",
    readinessScore: 96,
    tier: "Diamond",
    problemsSolved: 340,
    streakDays: 48,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
    targetCompany: "Google",
    xp: 4200,
  },
  {
    rank: 2,
    name: "Priya Patel",
    college: "BITS Pilani",
    readinessScore: 94,
    tier: "Diamond",
    problemsSolved: 310,
    streakDays: 35,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
    targetCompany: "Microsoft",
    xp: 3850,
  },
  {
    rank: 3,
    name: "Rohan Verma",
    college: "VIT Chennai",
    readinessScore: 91,
    tier: "Diamond",
    problemsSolved: 285,
    streakDays: 28,
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=60",
    targetCompany: "Amazon",
    xp: 3400,
  },
  {
    rank: 4,
    name: "Ananya Iyer",
    college: "NIT Trichy",
    readinessScore: 89,
    tier: "Platinum",
    problemsSolved: 245,
    streakDays: 22,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60",
    targetCompany: "Atlassian",
    xp: 3100,
  },
  {
    rank: 5,
    name: "Aditya Nair",
    college: "IIT Delhi",
    readinessScore: 88,
    tier: "Platinum",
    problemsSolved: 220,
    streakDays: 19,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60",
    targetCompany: "Uber",
    xp: 2950,
  },
  {
    rank: 6,
    name: "Sneha Mukherjee",
    college: "Jadavpur University",
    readinessScore: 86,
    tier: "Platinum",
    problemsSolved: 198,
    streakDays: 15,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60",
    targetCompany: "Adobe",
    xp: 2700,
  },
];

export async function getArenaLeaderboard(userId, user = null, collegeFilter = "all") {
  const currentUserName = user?.name || "Demo Candidate";
  const currentUserCollege = user?.college || "VIT Chennai";
  const currentUserTarget = user?.targetCompany || "Microsoft";

  let userEntry = {
    rank: 12,
    name: currentUserName,
    college: currentUserCollege,
    readinessScore: 82,
    tier: "Platinum",
    problemsSolved: 145,
    streakDays: 7,
    avatar: "",
    targetCompany: currentUserTarget,
    xp: 1850,
    isCurrentUser: true,
  };

  let list = [...DUMMY_LEADERBOARD_USERS, userEntry];

  if (collegeFilter && collegeFilter !== "all") {
    list = list.filter((u) => u.college.toLowerCase().includes(collegeFilter.toLowerCase()));
  }

  list.sort((a, b) => b.readinessScore - a.readinessScore);
  list = list.map((item, idx) => ({ ...item, rank: idx + 1 }));

  return {
    totalParticipants: 1420,
    userRank: list.find((u) => u.isCurrentUser)?.rank || 12,
    topRankers: list,
  };
}

export async function getUserSquad(userId, user = null) {
  let squad = await Squad.findOne({ "members.userId": userId });

  if (!squad) {
    const currentUserName = user?.name || "Demo Candidate";
    squad = await Squad.create({
      name: "Algorithmic Titans",
      code: "TITAN2026",
      description: "Dedicated peer squad grinding FAANG/Tier-1 campus placements & mock interviews daily.",
      avatar: "⚡",
      targetTier: "Tier 1 Product Companies",
      creatorId: userId,
      members: [
        {
          userId,
          name: currentUserName,
          role: "leader",
          joinedAt: new Date(),
          weeklyContribution: 12,
          readinessScore: 84,
          streakDays: 7,
        },
        {
          userId: new mongoose.Types.ObjectId(),
          name: "Karan Malhotra",
          role: "member",
          joinedAt: new Date(Date.now() - 3 * 86400000),
          weeklyContribution: 18,
          readinessScore: 88,
          streakDays: 14,
        },
        {
          userId: new mongoose.Types.ObjectId(),
          name: "Meera Sen",
          role: "member",
          joinedAt: new Date(Date.now() - 5 * 86400000),
          weeklyContribution: 9,
          readinessScore: 79,
          streakDays: 5,
        },
        {
          userId: new mongoose.Types.ObjectId(),
          name: "Siddharth Rao",
          role: "member",
          joinedAt: new Date(Date.now() - 8 * 86400000),
          weeklyContribution: 15,
          readinessScore: 86,
          streakDays: 9,
        },
      ],
      weeklyGoal: {
        title: "Collective Target: 60 Problems Solved",
        targetCount: 60,
        currentCount: 54,
        endsAt: new Date(Date.now() + 3 * 86400000),
      },
      messages: [
        {
          senderId: userId,
          senderName: "Karan Malhotra",
          text: "Just cracked Amazon OA 2nd question using Monotonic Stack! Shared my notes in Study Library 🚀",
          type: "achievement",
          createdAt: new Date(Date.now() - 4 * 3600000),
        },
        {
          senderId: userId,
          senderName: "Meera Sen",
          text: "Let us finish the remaining 6 problems today to hit our weekly squad target! 🔥",
          type: "cheer",
          createdAt: new Date(Date.now() - 1 * 3600000),
        },
      ],
      aggregateReadiness: 84,
    });
  }

  const totalReadiness = squad.members.reduce((acc, m) => acc + (m.readinessScore || 70), 0);
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
