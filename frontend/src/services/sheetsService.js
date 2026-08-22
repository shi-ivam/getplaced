import axios from "axios";
import { PY_API_URL } from "@/config/api";

const API_BASE = `${PY_API_URL}/api/sheets`;

const STORAGE_KEY_SOLVED = "getplaced_sheet_solved_problems";
const STORAGE_KEY_BOOKMARKS = "getplaced_sheet_bookmarked_problems";

export const sheetsService = {
  // Fetch overview of all 28 sheets grouped by category
  async getSheetsOverview() {
    try {
      const response = await axios.get(API_BASE);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch sheets overview:", err);
      throw err;
    }
  },

  // Fetch full tree and problem details for a specific sheet/playlist
  async getSheetDetails(sheetId) {
    try {
      const response = await axios.get(`${API_BASE}/${sheetId}`);
      return response.data;
    } catch (err) {
      console.error(`Failed to fetch sheet '${sheetId}':`, err);
      throw err;
    }
  },

  // Fetch complete offline article tutorial, code snippets, and problem details
  async getArticle(slugOrId) {
    try {
      const response = await axios.get(`${API_BASE}/articles/${slugOrId}`);
      return response.data;
    } catch (err) {
      console.error(`Failed to fetch article '${slugOrId}':`, err);
      throw err;
    }
  },

  // Search across all 3,150 problems
  async searchProblems({ query = "", category = "", difficulty = "", sheetId = "", page = 1, pageSize = 25 } = {}) {
    try {
      const params = {
        q: query,
        page,
        page_size: pageSize,
      };
      if (category && category !== "all") params.category = category;
      if (difficulty && difficulty !== "all") params.difficulty = difficulty;
      if (sheetId && sheetId !== "all") params.sheet_id = sheetId;

      const response = await axios.get(`${API_BASE}/search`, { params });
      return response.data;
    } catch (err) {
      console.error("Failed to search problems:", err);
      throw err;
    }
  },

  // --- Local Storage Progress Tracking ---

  getSolvedMap() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SOLVED);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  isProblemSolved(problemIdOrName) {
    const solved = this.getSolvedMap();
    return !!solved[problemIdOrName];
  },

  toggleProblemSolved(problemIdOrName, problemMeta = {}) {
    try {
      const solved = this.getSolvedMap();
      if (solved[problemIdOrName]) {
        delete solved[problemIdOrName];
      } else {
        solved[problemIdOrName] = {
          solvedAt: new Date().toISOString(),
          problemName: problemMeta.problem_name || problemMeta.title || problemIdOrName,
          sheetId: problemMeta.sheet_id,
          difficulty: problemMeta.difficulty,
          leetcodeSlug: problemMeta.leetcode_slug,
        };
      }
      localStorage.setItem(STORAGE_KEY_SOLVED, JSON.stringify(solved));
      window.dispatchEvent(new CustomEvent("getplaced_sheet_progress_updated", { detail: solved }));
      return !solved[problemIdOrName]; // returns whether it is now solved
    } catch (err) {
      console.error("Failed to persist solved status:", err);
      return false;
    }
  },

  getBookmarks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  toggleBookmark(problemIdOrName, problemMeta = {}) {
    try {
      const bookmarks = this.getBookmarks();
      if (bookmarks[problemIdOrName]) {
        delete bookmarks[problemIdOrName];
      } else {
        bookmarks[problemIdOrName] = {
          bookmarkedAt: new Date().toISOString(),
          problemName: problemMeta.problem_name || problemIdOrName,
          sheetId: problemMeta.sheet_id,
          difficulty: problemMeta.difficulty,
        };
      }
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
      return !!bookmarks[problemIdOrName];
    } catch (err) {
      console.error("Failed to persist bookmark:", err);
      return false;
    }
  },
};
