import type { NextRequest } from "next/server";
import { getPosts } from "@/lib/wp";

/** Latest news posts, for blocks rendered client-side in the editor preview. */
export async function GET(req: NextRequest) {
  const count = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("count")) || 3));
  return Response.json(await getPosts(count).catch(() => []));
}
