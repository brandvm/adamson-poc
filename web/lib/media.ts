// WordPress media URLs are absolute and carry whatever address WordPress was
// opened with (127.0.0.1, localhost, the LAN IP, or a hosted domain). Rewrite
// them to /wp-content/…, which next.config.ts proxies to WordPress, so images
// load from any device and the WordPress address never reaches the browser.
const WP = new URL(process.env.WP_URL ?? process.env.NEXT_PUBLIC_WP_URL ?? "http://127.0.0.1:9400");
const WP_PORT = WP.port;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Local/LAN: any host on WordPress's port. Hosted: WordPress's own host.
const MEDIA = WP_PORT
  ? new RegExp(`^https?://[^/]+:${WP_PORT}/wp-content/`)
  : new RegExp(`^https?://${esc(WP.hostname)}/wp-content/`);

export function relativeMedia<T>(value: T): T {
  if (typeof value === "string") return value.replace(MEDIA, "/wp-content/") as T;
  if (Array.isArray(value)) return value.map(relativeMedia) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, relativeMedia(v)])) as T;
  return value;
}

/** True for the WordPress editor's origin: WP_URL's origin, or (local/LAN) any host on its port. */
export function isWordPressOrigin(origin: string, wpOrigin?: string): boolean {
  try {
    const o = new URL(origin);
    if (wpOrigin && o.origin === new URL(wpOrigin).origin) return true;
    return Boolean(WP_PORT) && o.port === WP_PORT;
  } catch {
    return false;
  }
}
