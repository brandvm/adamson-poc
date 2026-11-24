// WordPress media, served through this app so the site works from any device on
// the network. This replaces a plain rewrite because videos need byte ranges:
// browsers seek a video (and the video scrub section does nothing but seek) by
// asking for parts of the file, and Safari refuses to seek without a 206 reply.
// The local WordPress server ignores Range, so ranges are cut here.
const WP = process.env.WP_URL ?? "http://127.0.0.1:9400";

type Ctx = { params: Promise<{ path: string[] }> };

async function serve(req: Request, { params }: Ctx, head = false) {
  const { path } = await params;
  const upstream = await fetch(`${WP}/wp-content/${path.map(encodeURIComponent).join("/")}`, {
    headers: req.headers.get("range") ? { range: req.headers.get("range")! } : undefined,
    cache: "no-store",
  });
  if (!upstream.ok && upstream.status !== 206) return new Response(null, { status: upstream.status });

  const type = upstream.headers.get("content-type") ?? "application/octet-stream";
  const base = { "content-type": type, "accept-ranges": "bytes", "cache-control": "public, max-age=3600" };

  // WordPress already answered the range: pass it on.
  if (upstream.status === 206) {
    return new Response(head ? null : upstream.body, {
      status: 206,
      headers: { ...base, "content-range": upstream.headers.get("content-range") ?? "", "content-length": upstream.headers.get("content-length") ?? "" },
    });
  }

  const range = req.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  if (!range) {
    return new Response(head ? null : upstream.body, { status: 200, headers: { ...base, "content-length": upstream.headers.get("content-length") ?? "" } });
  }

  // Cut the requested range from the full file.
  const buf = new Uint8Array(await upstream.arrayBuffer());
  const size = buf.length;
  let start = range[1] === "" ? size - Number(range[2]) : Number(range[1]);
  let end = range[1] !== "" && range[2] !== "" ? Number(range[2]) : size - 1;
  start = Math.max(0, start);
  end = Math.min(size - 1, end);
  if (start > end) return new Response(null, { status: 416, headers: { ...base, "content-range": `bytes */${size}` } });
  const part = buf.subarray(start, end + 1);
  return new Response(head ? null : part, {
    status: 206,
    headers: { ...base, "content-range": `bytes ${start}-${end}/${size}`, "content-length": String(part.length) },
  });
}

export const GET = (req: Request, ctx: Ctx) => serve(req, ctx);
export const HEAD = (req: Request, ctx: Ctx) => serve(req, ctx, true);
