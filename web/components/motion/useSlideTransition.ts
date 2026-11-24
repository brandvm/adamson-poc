"use client";
// Shared slide change for full-bleed sliders (Featured products, Products in action).
//
// Each slide is a full-size layer stacked in the section. On change, the
// incoming layer is revealed with a clip-path: it grows out of `origin` (the
// thumbnail or card that was clicked) or wipes in from the edge it comes from.
// Inside it, [data-move] artwork settles from slightly larger into place and
// [data-text] children rise in line by line. Product cut-outs
// ([data-move="product"]) stay pinned at their centre and only scale. The outgoing layer drifts away,
// scales up a touch and dims ([data-move="dim"]).
//
// - Rapid clicks ripple: each click starts a new reveal on top of the ones still
//   running (each new layer above the last); everything settles when the last
//   one finishes.
// - After mount, GSAP alone decides which layer is visible (React only sets the
//   initial state via `initialLayerStyle`), so re-renders can't undo a change.
// - Instant swap in the editor preview and under reduced motion.
import { useRef, useState } from "react";
import { gsap, reducedMotion } from "./gsap";

const REVEAL = "power3.inOut";
const SETTLE = "expo.out";

export const initialLayerStyle = (i: number) => ({ visibility: i === 0 ? "visible" : "hidden", zIndex: i === 0 ? 1 : 0 }) as const;

function insetOf(root: Element, el: Element) {
  const s = root.getBoundingClientRect();
  const t = el.getBoundingClientRect();
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
  const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 12;
  return `inset(${pct(t.top - s.top, s.height)} ${pct(s.right - t.right, s.width)} ${pct(s.bottom - t.bottom, s.height)} ${pct(t.left - s.left, s.width)} round ${radius}px)`;
}

export function useSlideTransition(count: number, { instant = false }: { instant?: boolean } = {}) {
  const section = useRef<HTMLElement>(null);
  const layers = useRef<(HTMLElement | null)[]>([]);
  const shown = useRef(0);
  const z = useRef(1); // stacking order for overlapping reveals
  const latest = useRef(0); // id of the most recent transition
  const [index, setIndex] = useState(0);

  const go = (target: number, dir: 1 | -1, origin?: Element | null) => {
    if (count < 2) return;
    const fromIdx = shown.current;
    const to = ((target % count) + count) % count;
    if (to === fromIdx) return;
    const root = section.current;
    const from = layers.current[fromIdx];
    const into = layers.current[to];
    shown.current = to;
    const id = ++latest.current;

    if (!root || !from || !into || instant || reducedMotion()) {
      layers.current.forEach((l, i) => l && gsap.set(l, { visibility: i === to ? "visible" : "hidden", zIndex: i === to ? 1 : 0 }));
      setIndex(to);
      return;
    }

    const q = (el: Element, sel: string) => el.querySelectorAll(sel);
    const start = origin
      ? insetOf(root, origin)
      : dir === 1
        ? "inset(0% 0% 0% 100% round 0px)"
        : "inset(0% 100% 0% 0% round 0px)";

    // The incoming layer may still be animating (as the outgoing side of an
    // earlier click): stop that and put it on top of everything.
    gsap.killTweensOf([into, ...q(into, "[data-move], [data-text], [data-text] > *")]);
    gsap.set(q(into, "[data-text]"), { clearProps: "opacity" });
    gsap.set(q(into, "[data-move='dim']"), { opacity: 0 });
    gsap.set(into, { visibility: "visible", zIndex: ++z.current, clipPath: start });

    // Only the most recent transition tidies up, once it has finished.
    const settle = () => {
      if (id !== latest.current) return;
      layers.current.forEach((l, i) => {
        if (!l) return;
        if (i === to) {
          gsap.set(l, { visibility: "visible", zIndex: 1, clearProps: "clipPath" });
          gsap.set(q(l, "[data-move]"), { clearProps: "transform,opacity" });
          gsap.set(q(l, "[data-text] > *"), { clearProps: "transform,opacity" });
        } else {
          gsap.killTweensOf([l, ...q(l, "[data-move], [data-text], [data-text] > *")]);
          gsap.set(l, { visibility: "hidden", zIndex: 0, clearProps: "clipPath" });
          gsap.set(q(l, "[data-move]"), { clearProps: "transform,opacity" });
          gsap.set(q(l, "[data-text]"), { clearProps: "opacity" });
        }
      });
      z.current = 1;
      setIndex(to);
    };

    const tl = gsap.timeline({ defaults: { ease: REVEAL, overwrite: "auto" }, onComplete: settle });
    // Incoming: reveal; artwork settles from slightly larger into place; text rises in.
    tl.to(into, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.1 }, 0)
      .fromTo(q(into, "[data-move='bg']"), { xPercent: 10 * dir, scale: 1.12 }, { xPercent: 0, scale: 1, duration: 1.7, ease: SETTLE }, 0.1)
      // Product cut-outs stay pinned at their centre and only scale into place.
      .fromTo(q(into, "[data-move='product']"), { scale: 1.1 }, { scale: 1, duration: 1.8, ease: SETTLE }, 0.15)
      .fromTo(q(into, "[data-move='word']"), { xPercent: 18 * dir, opacity: 0 }, { xPercent: 0, opacity: 0.7, duration: 1.6, ease: SETTLE }, 0.2)
      .fromTo(q(into, "[data-text] > *"), { y: "1.5rem", opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.07 }, 0.55)
      // Outgoing: pushed away, slightly larger, dimmed under the new slide.
      .to(q(from, "[data-move='bg']"), { xPercent: -8 * dir, scale: 1.05, duration: 1.1 }, 0)
      .to(q(from, "[data-move='product']"), { scale: 1.05, duration: 1.1 }, 0)
      .to(q(from, "[data-move='word']"), { xPercent: -12 * dir, opacity: 0, duration: 1 }, 0)
      .to(q(from, "[data-move='dim']"), { opacity: 0.55, duration: 1.1 }, 0)
      .to(q(from, "[data-text]"), { opacity: 0, duration: 0.4, ease: "power2.in" }, 0)
      .add(() => id === latest.current && setIndex(to), 0.55);
  };

  return {
    /** Put on the <section>: transitions are measured against it. */
    section,
    /** Current slide (updates halfway through a transition). */
    index: Math.min(index, Math.max(count - 1, 0)),
    layerRef: (i: number) => (el: HTMLElement | null) => {
      layers.current[i] = el;
    },
    /** Next (1) or previous (-1), looping. `origin`: element the slide grows out of. */
    step: (dir: 1 | -1, origin?: Element | null) => go(shown.current + dir, dir, origin),
    /** Jump to a slide. */
    goTo: (i: number, origin?: Element | null) => go(i, i > shown.current ? 1 : -1, origin),
  };
}
