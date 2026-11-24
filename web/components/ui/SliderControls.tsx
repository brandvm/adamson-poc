"use client";
/** Figma "Slider counter" + "Slider arrows". Tone: dark sections or light ones. */

type Props = {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  tone?: "dark" | "light";
  showCounter?: boolean;
  /** Arrows wrap around instead of disabling at the ends. */
  loop?: boolean;
  className?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function SliderArrows({ onPrev, onNext, canPrev = true, canNext = true, tone = "dark" }: { onPrev: () => void; onNext: () => void; canPrev?: boolean; canNext?: boolean; tone?: "dark" | "light" }) {
  const base =
    "flex size-11 items-center justify-center rounded-[1.625rem] border backdrop-blur-[4.5px] transition-opacity duration-200 disabled:opacity-30";
  const toneClass =
    tone === "light"
      ? "border-black/15 hover:bg-black/5"
      : "border-line bg-action-secondary hover:bg-action-secondary-hover hover:border-action-secondary-border-hover";
  const icon = (dir: "left" | "right") => `/icons/arrow-${dir}-${tone === "light" ? "light" : "dark"}-bg.svg`;
  return (
    <div className="flex items-center gap-2.5">
      <button type="button" aria-label="Previous" className={`${base} ${toneClass}`} onClick={onPrev} disabled={!canPrev}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon("left")} alt="" width={14} height={14} className="size-[0.875rem]" />
      </button>
      <button type="button" aria-label="Next" className={`${base} ${toneClass}`} onClick={onNext} disabled={!canNext}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon("right")} alt="" width={14} height={14} className="size-[0.875rem]" />
      </button>
    </div>
  );
}

export function SliderCounter({ index, total, tone = "dark" }: { index: number; total: number; tone?: "dark" | "light" }) {
  return (
    <div className="flex items-end gap-1 whitespace-nowrap">
      <span className={`type-counter ${tone === "light" ? "text-black" : "text-ink"}`}>{pad(index + 1)}</span>
      <span className="type-body-xs text-muted">/ {pad(total)}</span>
    </div>
  );
}

export default function SliderControls({ index, total, onPrev, onNext, tone = "dark", showCounter = true, loop = false, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {showCounter && <SliderCounter index={index} total={total} tone={tone} />}
      <SliderArrows onPrev={onPrev} onNext={onNext} canPrev={loop ? total > 1 : index > 0} canNext={loop ? total > 1 : index < total - 1} tone={tone} />
    </div>
  );
}
