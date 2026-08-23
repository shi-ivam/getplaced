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
    competencies: ["Conflict Resolution", "Disagree & Commit", "Teamwork"],
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

export function saveStory(story) {
  try {
    const stories = getSavedStories();
    const existingIndex = stories.findIndex((s) => s.id === story.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...stories];
      updated[existingIndex] = { ...story, updatedAt: new Date().toISOString() };
    } else {
      const newStory = {
        ...story,
        id: story.id || `story-${Date.now()}`,
        updatedAt: new Date().toISOString()
      };
      updated = [newStory, ...stories];
    }
    localStorage.setItem(STORIES_KEY, JSON.stringify(updated));
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
    return filtered;
  } catch (e) {
    console.error("Failed to delete story:", e);
    return getSavedStories();
  }
}

export function getSavedBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(questionId) {
  try {
    const bookmarks = getSavedBookmarks();
    let updated;
    if (bookmarks.includes(questionId)) {
      updated = bookmarks.filter((id) => id !== questionId);
    } else {
      updated = [...bookmarks, questionId];
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
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

export function recordPracticeResult(questionId, score, evaluation) {
  try {
    const history = getPracticeHistory();
    history[questionId] = {
      score,
      timestamp: new Date().toISOString(),
      evaluationSummary: {
        verdict: evaluation?.overall_verdict,
        starScore: evaluation?.star_compliance?.score,
        commScore: evaluation?.communication?.overall_communication_score
      }
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch (e) {
    console.warn("Failed to record practice result:", e);
    return {};
  }
}
