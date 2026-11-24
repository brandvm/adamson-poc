"use client";
// Count-up number (ported from wf-template recipes/snippets/count-up).
// Renders the final text first (for no-JS, crawlers and screen readers),
// then counts the first number in it from 0 when it scrolls into view.
// Left as written: no number, ranges, already on screen, reduced motion.
import { useEffect, useRef, useState } from "react";

export default function CountUp({ value, duration = 1600, className = "" }: { value: string; duration?: number; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const match = value.match(/\d[\d,]*(?:\.\d+)?/);
  const raw = match?.[0] ?? "";
  const target = Number(raw.replace(/,/g, ""));
  const decimals = (raw.split(".")[1] ?? "").length;
  const grouped = raw.includes(",");
  const format = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouped });
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    const node = el.current;
    if (!node || !match || /\d\s*[–—-]\s*\d/.test(value) || !Number.isFinite(target)) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = node.getBoundingClientRect();
    if (box.top < innerHeight && box.bottom > 0) return;
    setShown(format(0));
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setShown(format(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(tick);
          else setShown(null);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(node);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!match || match.index === undefined) return <span className={className}>{value}</span>;
  const before = value.slice(0, match.index);
  const after = value.slice(match.index + raw.length);
  return (
    <span ref={el} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        {before}
        <span className="inline-grid text-right">
          <span className="invisible col-start-1 row-start-1">{raw}</span>
          <span className="col-start-1 row-start-1">{shown ?? raw}</span>
        </span>
        {after}
      </span>
    </span>
  );
}
