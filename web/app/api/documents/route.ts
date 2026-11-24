import { getDocuments } from "@/lib/wp";

/** All documents, for the library block rendered client-side in the editor preview. */
export async function GET() {
  return Response.json(await getDocuments().catch(() => []));
}
