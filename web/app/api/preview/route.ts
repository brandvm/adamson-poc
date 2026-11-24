import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { PREVIEW_COOKIE, verifyPreviewToken } from "@/lib/preview";
import { getPage } from "@/lib/wp";

/** WordPress's Preview button lands here with a signed, expiring link. */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const id = p.get("id") ?? "";
  if (!verifyPreviewToken(id, p.get("expires") ?? "", p.get("token") ?? "")) {
    return new Response("Preview link is invalid or expired, or this app can't show drafts.", { status: 401 });
  }
  (await draftMode()).enable();
  (await cookies()).set(PREVIEW_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/" });
  // Open the previewed page on its own path (/ for the homepage).
  const page = await getPage({ id: Number(id), draft: true }).catch(() => null);
  redirect(page?.path ?? "/");
}
