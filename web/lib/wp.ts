import "server-only";
import { relativeMedia } from "./media";
import type { BlockExtras, DocumentItem, NewsPost, PagePayload, Product, Project, SiteSettings } from "./types";

const WP_URL = process.env.WP_URL ?? "http://127.0.0.1:9400";

/** Everything published is cached under one tag; a publish in WordPress expires it. */
export const WP_TAG = "wp";

type Opts = { draft?: boolean };

/**
 * Snapshot mode (WP_SNAPSHOT=1): read the content frozen by `npm run snapshot`
 * (web/snapshot/*.json, images in public/wp-content) instead of WordPress, so
 * the site can be hosted without WordPress. Drafts aren't available then.
 */
const SNAPSHOT = process.env.WP_SNAPSHOT === "1";

async function readSnapshot(file: string) {
  "use cache"; // the snapshot only changes with a new deploy
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  return JSON.parse(await readFile(join(process.cwd(), "snapshot", file), "utf8"));
}

async function fromSnapshot<T>(path: string): Promise<T> {
  const read = readSnapshot;
  if (path.startsWith("/page")) return read("page-home.json");
  if (path.startsWith("/settings")) return read("settings.json");
  if (path.startsWith("/products")) return read("products.json");
  if (path.startsWith("/posts")) {
    const count = Number(new URLSearchParams(path.split("?")[1]).get("count")) || 3;
    return (await read("posts.json")).slice(0, count);
  }
  throw new Error(`No snapshot for ${path}`);
}

async function wp<T>(path: string, { draft }: Opts = {}): Promise<T> {
  if (SNAPSHOT) {
    if (draft) throw new Error("Drafts aren't available in snapshot mode.");
    return fromSnapshot<T>(path);
  }
  const headers: Record<string, string> = {};
  if (draft) {
    const secret = process.env.PREVIEW_SECRET;
    if (!secret) throw new Error("This app can't read drafts (no PREVIEW_SECRET).");
    headers["x-adamson-preview"] = secret;
  }
  const res = await fetch(`${WP_URL}/wp-json/adamson/v1${path}`, {
    headers,
    ...(draft ? { cache: "no-store" as const } : { next: { tags: [WP_TAG], revalidate: 3600 } }),
  });
  if (!res.ok) throw new Error(`WordPress ${path} → ${res.status}`);
  // Serve WordPress media through this app (next.config.ts rewrites /wp-content),
  // so pages work from any device, not only the machine WordPress runs on.
  return relativeMedia(await res.json()) as T;
}

export const getPage = (opts: { slug?: string; path?: string; id?: number; draft?: boolean }) =>
  wp<PagePayload>(
    opts.id
      ? `/page?id=${opts.id}${opts.draft ? "&preview=1" : ""}`
      : `/page?path=${encodeURIComponent(opts.path ?? opts.slug ?? "home")}`,
    { draft: opts.draft },
  );

export const getSettings = () => wp<SiteSettings>("/settings");

export const getPosts = (count = 3) => wp<NewsPost[]>(`/posts?count=${count}`);

/** One news post with its full content, or null. */
export const getPost = (slug: string) => wp<NewsPost>(`/posts?slug=${encodeURIComponent(slug)}`).catch(() => null);

export const getDocuments = () => wp<DocumentItem[]>("/documents");

/** One document by slug, or null. */
export const getDocument = (slug: string) => wp<DocumentItem>(`/documents?slug=${encodeURIComponent(slug)}`).catch(() => null);

export const getProducts = () => wp<Product[]>("/products");

/** Case studies (WordPress → Projects), featured first. */
export const getProjects = () =>
  wp<Project[]>("/projects").then((list) => [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)));

/** Loads the extras that some blocks need (see components/blocks/registry.ts). */
export async function getBlockExtras(needs: Set<string>): Promise<BlockExtras> {
  const extras: BlockExtras = {};
  if (needs.has("posts")) extras.posts = await getPosts(6).catch(() => []);
  if (needs.has("allPosts")) extras.allPosts = await getPosts(50).catch(() => []);
  if (needs.has("documents")) extras.documents = await getDocuments().catch(() => []);
  if (needs.has("products")) extras.products = await getProducts().catch(() => []);
  if (needs.has("projects")) extras.projects = await getProjects().catch(() => []);
  return extras;
}
