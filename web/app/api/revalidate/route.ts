import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { WP_TAG } from "@/lib/wp";

/** Called by WordPress on publish/update/settings save. Expires all WordPress data immediately. */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-adamson-revalidate") !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  revalidateTag(WP_TAG, { expire: 0 });
  return Response.json({ ok: true, reason: body?.reason ?? null, at: new Date().toISOString() });
}
