/**
 * Return a browser-ready captcha source for either a complete data URL or a
 * raw base64 payload. Some VTOP responses are JPEG data URLs, so callers must
 * not assume PNG or prepend a second data URL header.
 */
export function normalizeCaptchaImageSrc(value) {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();
  const nestedDataUrlIndex = trimmed.indexOf("data:image/", "data:image/".length);

  // Recover values that were accidentally prefixed twice.
  if (nestedDataUrlIndex > 0) {
    return trimmed.slice(nestedDataUrlIndex);
  }

  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(trimmed)) {
    return trimmed;
  }

  if (/^(?:https?:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  const base64 = trimmed.replace(/\s+/g, "");
  const mimeType = base64.startsWith("/9j/")
    ? "image/jpeg"
    : base64.startsWith("R0lGOD")
      ? "image/gif"
      : base64.startsWith("UklGR")
        ? "image/webp"
        : "image/png";

  return `data:${mimeType};base64,${base64}`;
}
