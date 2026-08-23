import axios from "axios";
import { NODE_API_URL } from "@/config/api";

// Behavioral Story Matrix & Practice History Storage Service

const STORIES_KEY = "gp_behavioral_story_matrix_v1";
const BOOKMARKS_KEY = "gp_behavioral_bookmarks_v1";
const HISTORY_KEY = "gp_behavioral_practice_history_v1";

export const DEFAULT_MASTER_STORIES = [
  {
    id: "story-1",
    title: "Distributed Redis Caching Layer for Flash Traffic",
    project: "E-Commerce Checkout Microservice",
    techStack: "Go, PostgreSQL, Redis Cluster, OpenTelemetry",
    competencies: ["Technical Execution", "Scalability", "Dive Deep"],
    situation: "During flash sales, checkout API latency surged from 180ms to 950ms, causing database connection pool exhaustion and dropping transaction success to 92%.",
    task: "As backend lead, my mandate was to reduce P99 latency below 200ms and guarantee 99.99% checkout availability under 15k concurrent requests.",
    action: "I used OpenTelemetry distributed tracing to identify N+1 query locks in PostgreSQL. I architected a 2-tier Redis cache with optimistic locking, implemented asynchronous write-behind for inventory tallies, and added circuit breaker failover.",
    result: "P99 latency plummeted by 68% to 145ms. System handled 22,000 peak concurrent users without a single failure, processing $180k in flash revenue with zero double-spends.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "story-2",
    title: "Production Database Migration Incident & Blameless Post-Mortem",
    project: "Core Auth & Identity Platform",
    techStack: "PostgreSQL, Python FastAPI, Docker, GitHub Actions",
    competencies: ["Accountability & Failure", "Ownership", "Incident Management"],
    situation: "I authored a non-concurrent index creation migration that inadvertently acquired an exclusive table lock on our primary 40M-row user table during peak hours, creating a 12-minute outage.",
    task: "I needed to immediately restore availability, communicate status transparently to leadership, and institute systemic guardrails so no engineer could repeat the mistake.",
    action: "I triggered an instant rollback script within 90 seconds, notified the on-call channel, and authored a blameless post-mortem. I then authored automated custom linters in our CI/CD pipeline blocking non-concurrent index statements on production databases.",
    result: "Availability restored within 12 minutes. The new CI linter successfully caught 6 hazardous migrations across the engineering org over the following year, and I presented the findings in an org-wide engineering brown-bag.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "story-3",
    title: "Resolving Architectural Conflict on Real-Time Event Protocol",
    project: "Real-Time Collaboration Dashboard",
    techStack: "Node.js, WebSockets, Server-Sent Events (SSE), Redis Pub/Sub",
    competencies: ["Conflict Resolution", "Disagree & Commit", "Collaboration"],
    situation: "When building our live document notification system, a senior peer strongly advocated for bidirectional WebSockets, while I argued for Server-Sent Events (SSE) due to pure server-to-client broadcast needs and proxy compatibility.",
    task: "We needed to align rapidly without escalating or delaying the upcoming quarterly beta release.",
    action: "Instead of subjective debating, I built a 24-hour benchmarking harness simulating 10,000 concurrent client reconnections under spotty 3G networks to test memory footprints and proxy timeout behavior. I shared the objective metrics showing SSE consumed 45% less memory with automatic HTTP/2 multiplexing.",
    result: "My teammate appreciated the empirical data and we enthusiastically co-authored the SSE implementation. The feature shipped 3 days ahead of schedule with zero reconnection regressions.",
    updatedAt: new Date().toISOString()
  }
];

export function getSavedStories() {
  try {
    const raw = localStorage.getItem(STORIES_KEY);
    if (!raw) {
      localStorage.setItem(STORIES_KEY, JSON.stringify(DEFAULT_MASTER_STORIES));
      return DEFAULT_MASTER_STORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to read saved stories:", e);
    return DEFAULT_MASTER_STORIES;
  }
}

export async function fetchSavedStories() {
  try {
    const res = await axios.get(`${NODE_API_URL}/api/users/behavioral-stories`, {
      withCredentials: true,
    });
    if (res.data?.success && Array.isArray(res.data.stories) && res.data.stories.length > 0) {
      localStorage.setItem(STORIES_KEY, JSON.stringify(res.data.stories));
      return res.data.stories;
    }
  } catch (err) {
    console.warn("Could not fetch behavioral stories from backend, using local fallback:", err.message);
  }
  return getSavedStories();
}

export function saveStory(story) {
  try {
    const stories = getSavedStories();
    const existingIndex = stories.findIndex((s) => s.id === story.id);
    let updated;
    const storyId = story.id || `story-${Date.now()}`;
    const formattedStory = {
      ...story,
      id: storyId,
      updatedAt: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      updated = [...stories];
      updated[existingIndex] = formattedStory;
    } else {
      updated = [formattedStory, ...stories];
    }
    localStorage.setItem(STORIES_KEY, JSON.stringify(updated));

    // Asynchronously persist to backend
    axios.post(`${NODE_API_URL}/api/users/behavioral-stories`, formattedStory, {
      withCredentials: true,
    }).catch((err) => {
      console.warn("Backend sync for story failed:", err.message);
    });

    return updated;
  } catch (e) {
    console.error("Failed to save story:", e);
    return getSavedStories();
  }
}

export function deleteStory(id) {
  try {
    const stories = getSavedStories();
    const filtered = stories.filter((s) => s.id !== id);
    localStorage.setItem(STORIES_KEY, JSON.stringify(filtered));

    // Asynchronously delete from backend
    axios.delete(`${NODE_API_URL}/api/users/behavioral-stories/${encodeURIComponent(id)}`, {
      withCredentials: true,
    }).catch((err) => {
      console.warn("Backend delete for story failed:", err.message);
    });

    return filtered;
  } catch (e) {
    console.error("Failed to delete story:", e);
    return getSavedStories();
  }
}

export function getSavedBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function fetchSavedBookmarks() {
  try {
    const res = await axios.get(`${NODE_API_URL}/api/users/behavioral-bookmarks`, {
      withCredentials: true,
    });
    if (res.data?.success && Array.isArray(res.data.bookmarks)) {
      const stringified = res.data.bookmarks.map(String);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(stringified));
      return stringified;
    }
  } catch (err) {
    console.warn("Could not fetch bookmarks from backend:", err.message);
  }
  return getSavedBookmarks();
}

export function toggleBookmark(questionId) {
  if (questionId === undefined || questionId === null) return getSavedBookmarks();
  const qIdStr = String(questionId);
  try {
    const bookmarks = getSavedBookmarks();
    let updated;
    if (bookmarks.includes(qIdStr)) {
      updated = bookmarks.filter((id) => id !== qIdStr);
    } else {
      updated = [...bookmarks, qIdStr];
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));

    // Asynchronously persist to backend
    axios.post(`${NODE_API_URL}/api/users/behavioral-bookmarks`, { questionId: qIdStr }, {
      withCredentials: true,
    }).catch((err) => {
      console.warn("Backend sync for bookmark failed:", err.message);
    });

    return updated;
  } catch {
    return [];
  }
}

export function getPracticeHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function fetchPracticeHistory() {
  try {
    const res = await axios.get(`${NODE_API_URL}/api/users/behavioral-practice`, {
      withCredentials: true,
    });
    if (res.data?.success && res.data.history) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(res.data.history));
      return res.data.history;
    }
  } catch (err) {
    console.warn("Could not fetch practice history from backend:", err.message);
  }
  return getPracticeHistory();
}

export function recordPracticeResult(questionId, score, evaluation) {
  if (questionId === undefined || questionId === null) return getPracticeHistory();
  const qIdStr = String(questionId);
  try {
    const history = getPracticeHistory();
    history[qIdStr] = {
      score: score ?? 0,
      timestamp: new Date().toISOString(),
      evaluationSummary: {
        verdict: evaluation?.overall_verdict || (score >= 80 ? "Strong" : score >= 60 ? "Passable" : "Needs Improvement"),
        starScore: evaluation?.star_compliance?.score,
        commScore: evaluation?.communication?.overall_communication_score
      }
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    // Asynchronously persist to backend
    axios.post(`${NODE_API_URL}/api/users/behavioral-practice`, {
      questionId: qIdStr,
      score,
      evaluation,
    }, {
      withCredentials: true,
    }).catch((err) => {
      console.warn("Backend sync for practice result failed:", err.message);
    });

    return history;
  } catch (e) {
    console.warn("Failed to record practice result:", e);
    return {};
  }
}
