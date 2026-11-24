import BlockPreview from "./BlockPreview";

export const metadata = { robots: { index: false, follow: false } };

/** Rendered inside the WordPress editor (iframe). Blocks arrive by postMessage. */
export default function Page() {
  return <BlockPreview wpOrigin={process.env.WP_URL ?? "http://127.0.0.1:9400"} />;
}
