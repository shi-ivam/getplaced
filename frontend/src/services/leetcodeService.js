import axios from "axios";
import { PY_API_URL, NODE_API_URL } from "@/config/api";

const API_BASE = `${PY_API_URL}/api/problems`;
const PROFILE_API_BASE = `${NODE_API_URL}/api/leetcode`;

// In-memory workspace cache for zero latency UI rendering with localStorage fallback
const STORAGE_KEY_SOLVED = "getplaced_coding_solved_cache";
const STORAGE_KEY_DRAFTS = "getplaced_coding_drafts_cache";
const STORAGE_KEY_SUBMISSIONS = "getplaced_coding_submissions_cache";

const loadLocalCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

let workspaceCache = {
  solvedProblems: loadLocalCache(STORAGE_KEY_SOLVED),
  drafts: loadLocalCache(STORAGE_KEY_DRAFTS),
  submissions: loadLocalCache(STORAGE_KEY_SUBMISSIONS),
  loaded: false,
};

export const leetcodeService = {
  // --- LeetCode Connected Profile & Analytics (Node Backend) ---
  
  // Get connected profile and public statistics for authenticated user
  async getProfile() {
    const response = await axios.get(`${PROFILE_API_BASE}/profile`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Connect LeetCode profile using username or profile URL
  async connectProfile(username) {
    const response = await axios.post(
      `${PROFILE_API_BASE}/connect`,
      { username },
      { withCredentials: true }
    );
    return response.data;
  },

  // Refresh latest statistics from LeetCode public GraphQL
  async syncProfile() {
    const response = await axios.post(
      `${PROFILE_API_BASE}/sync`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  // Disconnect LeetCode profile from user account
  async disconnectProfile() {
    const response = await axios.delete(`${PROFILE_API_BASE}/disconnect`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Get in-depth submission and consistency analysis
  async getSubmissionAnalysis() {
    const response = await axios.get(`${PROFILE_API_BASE}/submissions-analysis`, {
      withCredentials: true,
    });
    return response.data;
  },

  // --- Python Problem Dataset & IDE Sandbox Catalog ---
  // Fetch paginated problem catalog
  async getProblems({ page = 1, pageSize = 20, search = "", difficulty = "", tag = "", sortBy = "question_id", sortOrder = "asc" } = {}) {
    const params = {
      page,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    if (search) params.search = search;
    if (difficulty && difficulty !== "all") params.difficulty = difficulty;
    if (tag && tag !== "all") params.tag = tag;

    const response = await axios.get(API_BASE, { params });
    return response.data;
  },

  // Get problem details by slug or ID
  async getProblem(slugOrId) {
    const response = await axios.get(`${API_BASE}/${slugOrId}`);
    return response.data;
  },

  // Get all topic tags with counts
  async getTags() {
    const response = await axios.get(`${API_BASE}/tags`);
    return response.data.tags || [];
  },

  // Get problem stats across difficulties
  async getStats() {
    const response = await axios.get(`${API_BASE}/stats`);
    return response.data;
  },

  // Pick random problem
  async getRandomProblem({ difficulty = "", tag = "" } = {}) {
    const params = {};
    if (difficulty && difficulty !== "all") params.difficulty = difficulty;
    if (tag && tag !== "all") params.tag = tag;

    const response = await axios.get(`${API_BASE}/random`, { params });
    return response.data;
  },

  // Get official solution & editorial
  async getSolution(slugOrId) {
    const response = await axios.get(`${API_BASE}/${slugOrId}/solution`);
    return response.data;
  },

  // Run code on sample test cases
  async runCode(slugOrId, code, customCases = null) {
    const response = await axios.post(`${API_BASE}/${slugOrId}/run`, {
      code,
      custom_cases: customCases,
    });
    return response.data;
  },

  // Submit solution to full test suite
  async submitCode(slugOrId, code) {
    const response = await axios.post(`${API_BASE}/${slugOrId}/submit`, {
      code,
    });
    return response.data;
  },

  // AI Coding Assistant (hints, explain, debug, optimize)
  async askAIAssist(slugOrId, code, queryType = "hint", errorMessage = null) {
    const response = await axios.post(`${API_BASE}/${slugOrId}/ai-assist`, {
      code,
      query_type: queryType,
      error_message: errorMessage,
    });
    return response.data;
  },

  // --- Backend Database Workspace Storage Syncing ---

  async fetchWorkspaceState() {
    try {
      const response = await axios.get(`${PROFILE_API_BASE}/workspace`, {
        withCredentials: true,
      });
      if (response.data?.success) {
        workspaceCache.solvedProblems = { ...workspaceCache.solvedProblems, ...(response.data.solvedProblems || {}) };
        workspaceCache.drafts = { ...workspaceCache.drafts, ...(response.data.drafts || {}) };
        workspaceCache.submissions = { ...workspaceCache.submissions, ...(response.data.submissions || {}) };
        workspaceCache.loaded = true;
        saveLocalCache(STORAGE_KEY_SOLVED, workspaceCache.solvedProblems);
        saveLocalCache(STORAGE_KEY_DRAFTS, workspaceCache.drafts);
        saveLocalCache(STORAGE_KEY_SUBMISSIONS, workspaceCache.submissions);
      }
    } catch (err) {
      console.warn("Could not fetch workspace state from backend database:", err.message);
    }
    return workspaceCache;
  },

  getSolvedProblems() {
    if (!workspaceCache.loaded) {
      this.fetchWorkspaceState();
    }
    return workspaceCache.solvedProblems || {};
  },

  async markProblemSolved(slug, details = {}) {
    const solvedData = {
      solvedAt: new Date().toISOString(),
      runtimeMs: details.runtime_ms,
      beatsPct: details.beats_runtime_pct,
      difficulty: details.difficulty,
      title: details.title,
    };
    workspaceCache.solvedProblems[slug] = solvedData;
    saveLocalCache(STORAGE_KEY_SOLVED, workspaceCache.solvedProblems);

    try {
      await axios.post(
        `${PROFILE_API_BASE}/solved`,
        { slug, details },
        { withCredentials: true }
      );
    } catch (e) {
      console.warn("Failed to persist solved status to backend DB:", e.message);
    }
  },

  isProblemSolved(slug) {
    const solved = this.getSolvedProblems();
    return !!solved[slug];
  },

  getSavedCode(slug, defaultCode = "") {
    if (!workspaceCache.loaded) {
      this.fetchWorkspaceState();
    }
    return workspaceCache.drafts[slug] || defaultCode;
  },

  async saveCode(slug, code) {
    workspaceCache.drafts[slug] = code;
    saveLocalCache(STORAGE_KEY_DRAFTS, workspaceCache.drafts);
    try {
      await axios.post(
        `${PROFILE_API_BASE}/draft`,
        { slug, code },
        { withCredentials: true }
      );
    } catch (e) {
      console.warn("Failed to save code draft to backend DB:", e.message);
    }
  },

  getSubmissions(slug) {
    if (!workspaceCache.loaded) {
      this.fetchWorkspaceState();
    }
    return workspaceCache.submissions[slug] || [];
  },

  async recordSubmission(slug, subData) {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: subData.status,
      runtime_ms: subData.runtime_ms,
      memory_mb: subData.memory_mb,
      beats_runtime_pct: subData.beats_runtime_pct,
      passed_count: subData.passed_count,
      total_count: subData.total_count,
      error: subData.error,
    };

    const currentList = workspaceCache.submissions[slug] || [];
    const updatedList = [newEntry, ...currentList].slice(0, 30);
    workspaceCache.submissions[slug] = updatedList;
    saveLocalCache(STORAGE_KEY_SUBMISSIONS, workspaceCache.submissions);

    try {
      await axios.post(
        `${PROFILE_API_BASE}/submission`,
        { slug, subData },
        { withCredentials: true }
      );
    } catch (e) {
      console.warn("Failed to save submission to backend DB:", e.message);
    }
  },
};
