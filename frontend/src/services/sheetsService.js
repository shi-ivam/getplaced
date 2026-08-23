import axios from "axios";
import { PY_API_URL, NODE_API_URL } from "@/config/api";

const API_BASE = `${PY_API_URL}/api/sheets`;
const PROGRESS_API_BASE = `${NODE_API_URL}/api/dsa/progress`;

const STORAGE_KEY_SOLVED = "getplaced_sheet_solved_problems";
const STORAGE_KEY_BOOKMARKS = "getplaced_sheet_bookmarked_problems";

let initialCloudSyncTriggered = false;

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

  // --- Cloud & Local Storage Progress Tracking ---

  async fetchProgressFromCloud() {
    try {
      const response = await axios.get(PROGRESS_API_BASE, {
        withCredentials: true,
      });

      if (response.data && response.data.success) {
        const cloudSheetProgress = response.data.sheetProgress || [];
        const localSolved = this.getSolvedMap();
        const localBookmarks = this.getBookmarks();

        cloudSheetProgress.forEach((item) => {
          if (!item || !item.problemId) return;
          const key = item.problemId;
          if (item.solved) {
            localSolved[key] = {
              solvedAt: item.solvedAt || new Date().toISOString(),
              problemName: item.problemName || key,
              sheetId: item.sheetId,
              difficulty: item.difficulty,
              leetcodeSlug: item.leetcodeSlug,
            };
          }
          if (item.bookmarked) {
            localBookmarks[key] = {
              bookmarkedAt: item.bookmarkedAt || new Date().toISOString(),
              problemName: item.problemName || key,
              sheetId: item.sheetId,
              difficulty: item.difficulty,
            };
          }
        });

        localStorage.setItem(STORAGE_KEY_SOLVED, JSON.stringify(localSolved));
        localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(localBookmarks));
        window.dispatchEvent(new CustomEvent("getplaced_sheet_progress_updated", { detail: localSolved }));
        window.dispatchEvent(new CustomEvent("getplaced_sheet_bookmarks_updated", { detail: localBookmarks }));
      }
    } catch (err) {
      // Graceful fallback for non-authenticated / offline states
      console.warn("Could not sync sheet progress with cloud DB:", err.message);
    }
  },

  getSolvedMap() {
    if (!initialCloudSyncTriggered) {
      initialCloudSyncTriggered = true;
      this.fetchProgressFromCloud();
    }
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
      const isNowSolved = !solved[problemIdOrName];
      const sheetId = problemMeta.sheet_id || problemMeta.sheetId || "";
      const problemName = problemMeta.problem_name || problemMeta.title || problemIdOrName;
      const difficulty = problemMeta.difficulty || "";
      const leetcodeSlug = problemMeta.leetcode_slug || problemMeta.leetcodeSlug || "";

      if (solved[problemIdOrName]) {
        delete solved[problemIdOrName];
      } else {
        solved[problemIdOrName] = {
          solvedAt: new Date().toISOString(),
          problemName,
          sheetId,
          difficulty,
          leetcodeSlug,
        };
      }
      localStorage.setItem(STORAGE_KEY_SOLVED, JSON.stringify(solved));
      window.dispatchEvent(new CustomEvent("getplaced_sheet_progress_updated", { detail: solved }));

      // Asynchronously synchronize to Node cloud database
      axios
        .post(
          PROGRESS_API_BASE,
          {
            type: "sheet",
            sheetId,
            problemId: problemIdOrName,
            problemName,
            difficulty,
            solved: isNowSolved,
            solvedAt: isNowSolved ? new Date().toISOString() : null,
            leetcodeSlug,
          },
          { withCredentials: true }
        )
        .catch((err) => {
          console.warn("Failed to persist solved status to cloud:", err.message);
        });

      return isNowSolved;
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

  isProblemBookmarked(problemIdOrName) {
    const bookmarks = this.getBookmarks();
    return !!bookmarks[problemIdOrName];
  },

  toggleBookmark(problemIdOrName, problemMeta = {}) {
    try {
      const bookmarks = this.getBookmarks();
      const isNowBookmarked = !bookmarks[problemIdOrName];
      const sheetId = problemMeta.sheet_id || problemMeta.sheetId || "";
      const problemName = problemMeta.problem_name || problemMeta.title || problemIdOrName;
      const difficulty = problemMeta.difficulty || "";
      const leetcodeSlug = problemMeta.leetcode_slug || problemMeta.leetcodeSlug || "";

      if (bookmarks[problemIdOrName]) {
        delete bookmarks[problemIdOrName];
      } else {
        bookmarks[problemIdOrName] = {
          bookmarkedAt: new Date().toISOString(),
          problemName,
          sheetId,
          difficulty,
        };
      }
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
      window.dispatchEvent(new CustomEvent("getplaced_sheet_bookmarks_updated", { detail: bookmarks }));

      // Asynchronously synchronize to Node cloud database
      axios
        .post(
          PROGRESS_API_BASE,
          {
            type: "sheet",
            sheetId,
            problemId: problemIdOrName,
            problemName,
            difficulty,
            bookmarked: isNowBookmarked,
            bookmarkedAt: isNowBookmarked ? new Date().toISOString() : null,
            leetcodeSlug,
          },
          { withCredentials: true }
        )
        .catch((err) => {
          console.warn("Failed to persist bookmark to cloud:", err.message);
        });

      return isNowBookmarked;
    } catch (err) {
      console.error("Failed to persist bookmark:", err);
      return false;
    }
  },
};
