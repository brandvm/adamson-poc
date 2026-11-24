"use client";
// Endless sideways row driven by the page scroll.
// - Drifts at `speed` px/s and loops seamlessly (renders as many copies as
//   the row's width needs, wraps after exactly one set).
// - Scrolling adds inertia: the faster you scroll, the faster it runs, then it
//   eases back to the base drift.
// - Direction follows the scroll: down → moves left, up → moves right. It keeps
//   drifting in the last direction.
// - Runs on the shared GSAP ticker (same clock as Lenis). Paused off screen.
//   Static under reduced motion and in the editor preview.
import { Children, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, reducedMotion } from "./gsap";

type Props = {
  children: ReactNode;
  speed?: number; // base drift, px/s
  boost?: number; // px/s added per px/s of scroll velocity
  className?: string;
  itemClassName?: string;
  still?: boolean;
};

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function Marquee({ children, speed = 40, boost = 0.35, className = "", itemClassName = "", still = false }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const firstSet = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const items = Children.toArray(children);

  // Enough copies that one set can scroll out while the row stays full.
  useIsoLayoutEffect(() => {
    const measure = () => {
      const set = firstSet.current?.offsetWidth ?? 0;
      const view = wrap.current?.offsetWidth ?? 0;
      if (set > 0) setCopies(Math.max(2, Math.ceil(view / set) + 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [items.length]);

  useEffect(() => {
    const row = track.current;
    const set = firstSet.current;
    const box = wrap.current;
    if (!row || !set || !box || still || reducedMotion()) return;

    let x = 0;
    let dir = -1; // -1 = moving left
    let extra = 0; // inertia from scrolling, px/s
    let width = set.offsetWidth;
    let visible = true;

    const ro = new ResizeObserver(() => (width = set.offsetWidth));
    ro.observe(set);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(box);

    const trigger = ScrollTrigger.create({
      onUpdate(self) {
        dir = self.direction === 1 ? -1 : 1;
        extra = Math.max(extra, Math.min(Math.abs(self.getVelocity()) * boost, 2400));
      },
    });

    const tick = (_time: number, deltaMs: number) => {
      if (!visible || width <= 0) return;
      const dt = Math.min(deltaMs, 64) / 1000;
      extra *= Math.exp(-dt * 2.5); // ease back to the base drift
      x += (speed + extra) * dir * dt;
      if (x <= -width) x += width;
      else if (x > 0) x -= width;
      row.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
      ro.disconnect();
      io.disconnect();
    };
  }, [speed, boost, still, copies]);

  return (
    <div ref={wrap} className="overflow-hidden">
      <div ref={track} className="flex w-max will-change-transform">
        {Array.from({ length: copies }, (_, c) => (
          <div key={c} ref={c === 0 ? firstSet : undefined} aria-hidden={c > 0 || undefined} className={`flex shrink-0 ${className}`}>
            {items.map((child, i) => (
              <div key={i} className={`shrink-0 ${itemClassName}`}>{child}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
