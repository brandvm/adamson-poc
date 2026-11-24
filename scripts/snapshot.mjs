// Freezes the current WordPress content into the web app so the site can be
// hosted without WordPress (e.g. on Vercel for a client to view):
//   web/snapshot/*.json                 page, settings, posts, products
//   web/public/wp-content/uploads/...   every image/video they use
// Run with WordPress up:  npm run snapshot   (then deploy with WP_SNAPSHOT=1)
import { mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";

const WP = process.env.WP_URL ?? "http://127.0.0.1:9400";
const OUT = new URL("../web/snapshot/", import.meta.url).pathname;
const PUBLIC = new URL("../web/public/", import.meta.url).pathname;

const sources = {
  "page-home.json": "/page?slug=home",
  "settings.json": "/settings",
  "posts.json": "/posts?count=12",
  "products.json": "/products",
};

const media = new Set();
const UPLOAD = /^https?:\/\/[^/]+(\/wp-content\/uploads\/[^?#]+)/;
function localize(value) {
  if (typeof value === "string") {
    const m = value.match(UPLOAD);
    if (m) {
      media.add(m[1]);
      return m[1];
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(localize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localize(v)]));
  return value;
}

await rm(OUT, { recursive: true, force: true });
await rm(join(PUBLIC, "wp-content"), { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const [file, path] of Object.entries(sources)) {
  const res = await fetch(`${WP}/wp-json/adamson/v1${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  await writeFile(join(OUT, file), JSON.stringify(localize(await res.json()), null, 1));
  console.log("saved", file);
}

let bytes = 0;
for (const rel of media) {
  const res = await fetch(`${WP}${rel}`);
  if (!res.ok) throw new Error(`${rel} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = join(PUBLIC, decodeURIComponent(rel));
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  bytes += buf.length;
}
await writeFile(join(OUT, "meta.json"), JSON.stringify({ takenAt: new Date().toISOString(), media: media.size }, null, 1));
console.log(`copied ${media.size} media files (${(bytes / 1e6).toFixed(1)} MB)`);
