import axios from "axios";
import { PY_API_URL } from "@/config/api";

const API_BASE = `${PY_API_URL}/api/problems`;

export const leetcodeService = {
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

  // --- Local Storage Progress Tracking ---
  
  getSolvedProblems() {
    try {
      const stored = localStorage.getItem("getplaced_solved_problems");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  markProblemSolved(slug, details = {}) {
    try {
      const solved = this.getSolvedProblems();
      solved[slug] = {
        solvedAt: new Date().toISOString(),
        runtimeMs: details.runtime_ms,
        beatsPct: details.beats_runtime_pct,
        difficulty: details.difficulty,
        title: details.title,
      };
      localStorage.setItem("getplaced_solved_problems", JSON.stringify(solved));
    } catch (e) {
      console.error("Failed to persist solved status:", e);
    }
  },

  isProblemSolved(slug) {
    const solved = this.getSolvedProblems();
    return !!solved[slug];
  },

  getSavedCode(slug, defaultCode = "") {
    try {
      const drafts = JSON.parse(localStorage.getItem("getplaced_code_drafts") || "{}");
      return drafts[slug] || defaultCode;
    } catch {
      return defaultCode;
    }
  },

  saveCode(slug, code) {
    try {
      const drafts = JSON.parse(localStorage.getItem("getplaced_code_drafts") || "{}");
      drafts[slug] = code;
      localStorage.setItem("getplaced_code_drafts", JSON.stringify(drafts));
    } catch (e) {
      console.error("Failed to save code draft:", e);
    }
  },

  getSubmissions(slug) {
    try {
      const allSubs = JSON.parse(localStorage.getItem("getplaced_submissions") || "{}");
      return allSubs[slug] || [];
    } catch {
      return [];
    }
  },

  recordSubmission(slug, subData) {
    try {
      const allSubs = JSON.parse(localStorage.getItem("getplaced_submissions") || "{}");
      const list = allSubs[slug] || [];
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
      list.unshift(newEntry);
      allSubs[slug] = list.slice(0, 30); // Keep last 30 submissions per problem
      localStorage.setItem("getplaced_submissions", JSON.stringify(allSubs));
    } catch (e) {
      console.error("Failed to save submission:", e);
    }
  }
};
