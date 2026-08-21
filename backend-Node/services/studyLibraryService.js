import mongoose from "mongoose";
import StudyLibrary from "../models/studyLibraryModel.js";
import User from "../models/userModel.js";

// Comprehensive Curated YouTube Study Library Catalog
export const CURATED_STUDY_VIDEOS = [
  // DSA - Arrays & Two Pointers
  {
    id: "yt-dsa-two-pointers",
    title: "Two Pointers Technique & Sliding Window Complete Masterclass",
    channel: "NeetCode",
    videoUrl: "https://www.youtube.com/watch?v=On03HWe2tZM",
    duration: "42:15",
    durationMinutes: 42,
    difficulty: "Medium",
    category: "DSA",
    topic: "Two Pointers & Sliding Window",
    tags: ["Arrays", "Two Pointers", "Sliding Window", "LeetCode"],
    keyTakeaways: ["Shrinking and expanding windows", "O(N) time complexity optimization", "Trap Rain Water & 3Sum patterns"],
    thumbnailUrl: "https://images.unsplash.com/photo-1516116211227-bbc13c734919?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "yt-dsa-dp-intro",
    title: "Dynamic Programming: From Recursion to Memoization & Tabulation",
    channel: "take U forward (Striver)",
    videoUrl: "https://www.youtube.com/watch?v=tyB0ztf0DNY",
    duration: "58:30",
    durationMinutes: 58,
    difficulty: "Hard",
    category: "DSA",
    topic: "Dynamic Programming",
    tags: ["DP", "Recursion", "Memoization", "Striver A2Z"],
    keyTakeaways: ["State definition & base cases", "1D vs 2D DP grids", "Space optimization techniques"],
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "yt-dsa-trees-graphs",
    title: "Graph Algorithms Full Course: BFS, DFS, Dijkstra, Topo Sort",
    channel: "freeCodeCamp.org",
    videoUrl: "https://www.youtube.com/watch?v=tWVWeAqZ0WU",
    duration: "1:45:00",
    durationMinutes: 105,
    difficulty: "Hard",
    category: "DSA",
    topic: "Graphs & Trees",
    tags: ["Graphs", "BFS", "DFS", "Dijkstra", "Shortest Path"],
    keyTakeaways: ["Adjacency lists vs matrices", "Cycle detection in directed/undirected graphs", "Shortest path in weighted DAGs"],
    thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=60",
  },

  // System Design & Architecture
  {
    id: "yt-sd-scalability-basics",
    title: "System Design for Beginners: Caching, Load Balancing & Sharding",
    channel: "Gaurav Sen",
    videoUrl: "https://www.youtube.com/watch?v=SqcXvc3ZmRU",
    duration: "32:40",
    durationMinutes: 32,
    difficulty: "Medium",
    category: "System Design",
    topic: "Distributed Systems Basics",
    tags: ["System Design", "Scalability", "Redis", "Load Balancer", "High Level Design"],
    keyTakeaways: ["Horizontal vs Vertical scaling", "Consistent Hashing", "Database Sharding & Replication"],
    thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "yt-sd-rate-limiter",
    title: "Design a Distributed Rate Limiter (Token Bucket / Leaky Bucket)",
    channel: "ByteByteGo",
    videoUrl: "https://www.youtube.com/watch?v=FU4Wisl4544",
    duration: "18:20",
    durationMinutes: 18,
    difficulty: "Medium",
    category: "System Design",
    topic: "Rate Limiting & Security",
    tags: ["Rate Limiter", "Redis", "Token Bucket", "ByteByteGo"],
    keyTakeaways: ["Token bucket vs sliding window counter", "Redis Lua scripts for atomicity", "Handling multi-region sync"],
    thumbnailUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=60",
  },

  // Full Stack & Web Development
  {
    id: "yt-web-react-performance",
    title: "React Performance Optimization & Advanced Hooks Deep-Dive",
    channel: "Chai aur Code",
    videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
    duration: "48:10",
    durationMinutes: 48,
    difficulty: "Medium",
    category: "Web Development",
    topic: "React & Modern Frontend",
    tags: ["React", "useMemo", "useCallback", "Virtual DOM", "Frontend"],
    keyTakeaways: ["Preventing unnecessary re-renders", "Profiling React DevTools", "Code splitting with React.lazy"],
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "yt-web-node-architecture",
    title: "Node.js Architecture, Event Loop, Libuv & Microservices",
    channel: "Hussein Nasser",
    videoUrl: "https://www.youtube.com/watch?v=P9csgxBgaZ8",
    duration: "38:50",
    durationMinutes: 38,
    difficulty: "Hard",
    category: "Web Development",
    topic: "Node.js & Backend Systems",
    tags: ["Node.js", "Event Loop", "Libuv", "Backend Architecture"],
    keyTakeaways: ["Event loop phases (Timer, Poll, Check)", "Non-blocking I/O thread pool", "Streams and backpressure"],
    thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&auto=format&fit=crop&q=60",
  },

  // Core CS Subjects
  {
    id: "yt-cs-os-concurrency",
    title: "Operating Systems: Process Synchronization, Mutex & Semaphores",
    channel: "Gate Smashers",
    videoUrl: "https://www.youtube.com/watch?v=ph2awKa8r5Y",
    duration: "26:15",
    durationMinutes: 26,
    difficulty: "Medium",
    category: "Core CS",
    topic: "Operating Systems",
    tags: ["OS", "Processes", "Threads", "Deadlock", "Gate Smashers"],
    keyTakeaways: ["Critical section problem", "Counting vs Binary Semaphores", "Banker Algorithm for Deadlock Avoidance"],
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "yt-cs-dbms-indexing",
    title: "DBMS: B-Trees, B+ Trees & Database Indexing Explained",
    channel: "Neso Academy",
    videoUrl: "https://www.youtube.com/watch?v=aZjYr87r1b8",
    duration: "31:40",
    durationMinutes: 31,
    difficulty: "Medium",
    category: "Core CS",
    topic: "DBMS & SQL",
    tags: ["DBMS", "SQL", "Indexing", "B-Tree", "ACID"],
    keyTakeaways: ["Why databases use B+ Trees for range queries", "Clustered vs Non-Clustered index", "ACID transactions & isolation levels"],
    thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "yt-cs-cn-tcp-ip",
    title: "Computer Networks: TCP 3-Way Handshake & OSI Model",
    channel: "NetworkChuck",
    videoUrl: "https://www.youtube.com/watch?v=bW_IPf7i48E",
    duration: "22:50",
    durationMinutes: 22,
    difficulty: "Easy",
    category: "Core CS",
    topic: "Computer Networks",
    tags: ["Networks", "TCP", "UDP", "HTTP/HTTPS", "DNS"],
    keyTakeaways: ["SYN, SYN-ACK, ACK sequence", "TCP vs UDP tradeoffs", "DNS lookup flow and TLS handshake"],
    thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=60",
  },

  // Behavioral & Mock Interview
  {
    id: "yt-hr-star-method",
    title: "Ace the Behavioral Interview: The STAR Method & Amazon Tenets",
    channel: "Exponent",
    videoUrl: "https://www.youtube.com/watch?v=VpIdw_4qI5s",
    duration: "24:30",
    durationMinutes: 24,
    difficulty: "Easy",
    category: "Behavioral",
    topic: "Behavioral & HR Prep",
    tags: ["Behavioral", "STAR Method", "HR Round", "Exponent"],
    keyTakeaways: ["Structuring Situation, Task, Action, Result", "Leadership principle alignment", "Handling negative outcome questions"],
    thumbnailUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "yt-resume-ats-secrets",
    title: "How FAANG Recruiters Screen Resumes: ATS Secrets & Bullet Points",
    channel: "TechLead",
    videoUrl: "https://www.youtube.com/watch?v=yp693O87GmM",
    duration: "16:40",
    durationMinutes: 16,
    difficulty: "Easy",
    category: "Resume",
    topic: "Resume & ATS Engineering",
    tags: ["Resume", "ATS", "Recruiter Tips", "Job Search"],
    keyTakeaways: ["XYZ resume bullet formula: Accomplished [X] measured by [Y] by doing [Z]", "Keywords placement", "Single-column formatting rules"],
    thumbnailUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=60",
  },
];

export async function getStudyLibrary(userId, category = null, search = "") {
  let userLib = await StudyLibrary.findOne({ userId });
  if (!userLib) {
    userLib = await StudyLibrary.create({
      userId,
      bookmarkedVideoIds: ["yt-sd-scalability-basics", "yt-dsa-two-pointers"],
      notes: [
        {
          videoId: "yt-sd-scalability-basics",
          noteText: "Key: Redis cache invalidation strategies (Write-through vs Write-back). Always mention latency numbers in interview.",
          updatedAt: new Date(),
        },
      ],
      progress: [
        {
          videoId: "yt-sd-scalability-basics",
          watchedSeconds: 1200,
          completed: false,
          lastWatchedAt: new Date(),
        },
      ],
    });
  }

  let videos = CURATED_STUDY_VIDEOS;

  if (category && category !== "All") {
    videos = videos.filter((v) => v.category.toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.toLowerCase();
    videos = videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.topic.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  const bookmarkedSet = new Set(userLib.bookmarkedVideoIds || []);
  const notesMap = new Map((userLib.notes || []).map((n) => [n.videoId, n.noteText]));
  const progressMap = new Map((userLib.progress || []).map((p) => [p.videoId, p]));

  const enrichedVideos = videos.map((v) => {
    const prog = progressMap.get(v.id);
    return {
      ...v,
      isBookmarked: bookmarkedSet.has(v.id),
      userNote: notesMap.get(v.id) || "",
      isCompleted: prog?.completed || false,
      watchedSeconds: prog?.watchedSeconds || 0,
    };
  });

  return {
    totalVideos: enrichedVideos.length,
    savedCount: userLib.bookmarkedVideoIds?.length || 0,
    completedCount: (userLib.progress || []).filter((p) => p.completed).length,
    categories: ["All", "DSA", "System Design", "Web Development", "Core CS", "Behavioral", "Resume"],
    videos: enrichedVideos,
  };
}

export async function toggleVideoBookmark(userId, videoId) {
  let userLib = await StudyLibrary.findOne({ userId });
  if (!userLib) {
    userLib = await StudyLibrary.create({ userId });
  }

  const index = userLib.bookmarkedVideoIds.indexOf(videoId);
  let isBookmarked = false;

  if (index > -1) {
    userLib.bookmarkedVideoIds.splice(index, 1);
    isBookmarked = false;
  } else {
    userLib.bookmarkedVideoIds.push(videoId);
    isBookmarked = true;
  }

  await userLib.save();
  return { success: true, videoId, isBookmarked };
}

export async function saveVideoNote(userId, videoId, noteText) {
  let userLib = await StudyLibrary.findOne({ userId });
  if (!userLib) {
    userLib = await StudyLibrary.create({ userId });
  }

  const existingNote = userLib.notes.find((n) => n.videoId === videoId);
  if (existingNote) {
    existingNote.noteText = noteText;
    existingNote.updatedAt = new Date();
  } else {
    userLib.notes.push({ videoId, noteText, updatedAt: new Date() });
  }

  await userLib.save();
  return { success: true, videoId, noteText };
}

export async function updateWatchProgress(userId, videoId, watchedSeconds, completed = false) {
  let userLib = await StudyLibrary.findOne({ userId });
  if (!userLib) {
    userLib = await StudyLibrary.create({ userId });
  }

  const existingProg = userLib.progress.find((p) => p.videoId === videoId);
  if (existingProg) {
    existingProg.watchedSeconds = watchedSeconds;
    existingProg.completed = completed;
    existingProg.lastWatchedAt = new Date();
  } else {
    userLib.progress.push({
      videoId,
      watchedSeconds,
      completed,
      lastWatchedAt: new Date(),
    });
  }

  await userLib.save();
  return { success: true, videoId, completed };
}
