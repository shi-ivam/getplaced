import assert from "node:assert/strict";
import { normalizeCaptchaImageSrc } from "./src/utils/captchaImage.js";

const jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ";
const malformed = `data:image/png;base64,${jpeg}`;

assert.equal(normalizeCaptchaImageSrc(jpeg), jpeg);
assert.equal(normalizeCaptchaImageSrc(malformed), jpeg);
assert.equal(normalizeCaptchaImageSrc("/9j/4AAQSkZJRgABAQ"), jpeg);
assert.equal(
  normalizeCaptchaImageSrc("iVBORw0KGgoAAAANSUhEUg"),
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg"
);
assert.equal(normalizeCaptchaImageSrc(""), "");

console.log("VTOP captcha image normalization tests passed");
