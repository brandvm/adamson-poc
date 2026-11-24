import type { NextRequest } from "next/server";
import { getBlockExtras } from "@/lib/wp";

/** Data some blocks need besides their own (products, latest posts), for the editor's live preview. */
export async function GET(req: NextRequest) {
  const needs = new Set((req.nextUrl.searchParams.get("needs") ?? "").split(",").filter(Boolean));
  return Response.json(await getBlockExtras(needs));
}
