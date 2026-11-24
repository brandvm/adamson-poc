import type { ReactNode } from "react";

/**
 * Figma "Section header". Layout: row (title left, description + action right,
 * bottom-aligned), stacked (eyebrow, title, description, action below) or center.
 * Size: h1 (96px) or h2 (56px). Tone: dark sections (Figma dark mode: accent
 * #ab9981, secondary #c0c1c2) or light ones (gold #8a6e4b, secondary #686b6d).
 */
type Tone = "dark" | "light";
type Props = {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  layout?: "row" | "stacked" | "center";
  size?: "h1" | "h2";
  tone?: Tone;
  /** Description width in rem (Figma: 24.375 in row headers, 20.625 in stacked ones). */
  descriptionWidth?: number;
  className?: string;
};

export function Eyebrow({ children, tone = "dark", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  if (!children) return null;
  return <p className={`type-eyebrow ${tone === "light" ? "text-gold" : "text-accent"} ${className}`}>{children}</p>;
}

export default function SectionHeader({ eyebrow, title, description, action, layout = "row", size = "h1", tone = "dark", descriptionWidth, className = "" }: Props) {
  const light = tone === "light";
  const titleClass = `${size === "h1" ? "type-h1" : "type-h2"} ${light ? "text-black" : "text-ink"}`;

  if (layout === "row") {
    return (
      <div className={`flex items-end justify-between gap-8 max-lg:flex-col max-lg:items-start max-lg:gap-5 ${className}`}>
        <div className="flex flex-col gap-4">
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
          {title && <h2 className={titleClass}>{title}</h2>}
        </div>
        {(description || action) && (
          <div className="flex items-center gap-12 pb-[0.3125rem] max-lg:w-full max-lg:justify-between max-lg:gap-6 max-lg:pb-0">
            {description && (
              <p
                className={`type-body-m lg:w-(--desc-w) ${light ? "text-secondary" : "text-subtle"}`}
                style={{ "--desc-w": `${descriptionWidth ?? 24.375}rem` } as React.CSSProperties}
              >
                {description}
              </p>
            )}
            {action}
          </div>
        )}
      </div>
    );
  }

  const center = layout === "center";
  return (
    <div className={`flex flex-col gap-4 ${center ? "items-center text-center" : "items-start"} ${className}`}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      {title && <h2 className={titleClass}>{title}</h2>}
      {description && (
        <p className={`type-body-s ${light ? "text-secondary" : "text-subtle"}`} style={{ maxWidth: `${descriptionWidth ?? 20.625}rem` }}>
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
