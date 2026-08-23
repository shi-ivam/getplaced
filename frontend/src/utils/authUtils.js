import { getCtaFeature } from "@/config/ctaFeatures";

/**
 * Check if the user is authenticated in the current browser session.
 */
export function isUserLoggedIn() {
  try {
    const token = localStorage.getItem("getplaced_token");
    const user = localStorage.getItem("getplaced_user");
    return Boolean(token || user);
  } catch (e) {
    return false;
  }
}

/**
 * Build the URL to navigate to when clicking a CTA.
 * If user is logged in -> direct target path (e.g. /app/resume)
 * If user is NOT logged in -> /login or /register with query parameters
 */
export function getCtaHref(ctaKey, mode = "login", customTarget = null) {
  const feature = getCtaFeature(ctaKey);
  const targetPath = customTarget || feature.targetPath || "/app";

  if (isUserLoggedIn()) {
    return targetPath;
  }

  const authRoute = mode === "register" ? "/register" : "/login";
  return `${authRoute}?cta=${feature.id}&redirect=${encodeURIComponent(targetPath)}`;
}

/**
 * Smart navigation helper for React Router
 */
export function navigateToCta(navigate, ctaKey, mode = "login", customTarget = null) {
  const href = getCtaHref(ctaKey, mode, customTarget);
  navigate(href);
}
