export const NODE_API_URL = import.meta.env.VITE_NODE_API_URL !== undefined && import.meta.env.VITE_NODE_API_URL !== null
  ? import.meta.env.VITE_NODE_API_URL
  : (import.meta.env.PROD ? "" : "http://localhost:3000");

export const PY_API_URL = import.meta.env.VITE_PY_API_URL !== undefined && import.meta.env.VITE_PY_API_URL !== null
  ? import.meta.env.VITE_PY_API_URL
  : (import.meta.env.PROD ? "" : "http://localhost:8000");

export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@getplaced.ai";


