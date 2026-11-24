import type { Link } from "@/lib/types";

/**
 * Figma "Button": Primary = gold (one per view), Contrast = white on dark /
 * black on light, Secondary = outline glass. Size S 36px, M 42px.
 */
type Variant = "primary" | "secondary" | "contrast" | "contrast-light" | "secondary-light";
type Props = { link?: Link; label?: string; href?: string; variant?: Variant; size?: "s" | "m"; className?: string; icon?: React.ReactNode };

const variants: Record<Variant, string> = {
  primary: "bg-gold text-white hover:brightness-110",
  contrast: "bg-white text-black hover:bg-gold-50",
  "contrast-light": "bg-black text-white hover:bg-raised",
  secondary:
    "border border-line bg-action-secondary text-ink backdrop-blur-[5px] hover:bg-action-secondary-hover hover:border-action-secondary-border-hover",
  "secondary-light": "border border-black/15 text-black hover:bg-black/5",
};

export default function Button({ link, label, href, variant = "primary", size = "s", className = "", icon }: Props) {
  const text = label ?? link?.label;
  const url = href ?? link?.url ?? "#";
  if (!text) return null;
  const h = size === "m" ? "h-[2.625rem] px-5 type-button-l" : "h-9 px-4 type-button";
  return (
    <a
      href={url}
      className={`inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-200 ${h} ${variants[variant]} ${className}`}
    >
      {icon}
      {text}
    </a>
  );
}
