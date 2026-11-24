import { createHmac, timingSafeEqual } from "node:crypto";

export const PREVIEW_COOKIE = "adamson_preview_id";

/**
 * Checks the signed link WordPress's Preview button creates:
 * token = HMAC-SHA256(`${id}|${expires}`, PREVIEW_SECRET). Only the preview app
 * has PREVIEW_SECRET, so the public www app can never enter draft mode.
 */
export function verifyPreviewToken(id: string, expires: string, token: string): boolean {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret || !id || !expires || !token) return false;
  if (Number(expires) * 1000 < Date.now()) return false;
  const expected = createHmac("sha256", secret).update(`${id}|${expires}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
