/* eslint-disable @next/next/no-img-element */
import type { Media } from "@/lib/types";

/** An image picked in WordPress. Renders nothing if the editor left it empty. */
export default function Img({ media, className = "", alt, eager = false, style, ...rest }: { media?: Media; className?: string; alt?: string; eager?: boolean; style?: React.CSSProperties } & Record<`data-${string}`, string>) {
  if (!media?.url) return null;
  return (
    <img
      src={media.url}
      alt={alt ?? media.alt ?? ""}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
      style={style}
      {...rest}
    />
  );
}
