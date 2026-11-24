"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { BlockProps, Link } from "@/lib/types";
import Button from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeader";
import SliderControls from "@/components/ui/SliderControls";

// 08 Timeline (Figma 463:969). Huge stacked years: the current milestone's year
// sits at the bottom in gold, later years stack above it, fading out. The arrows
// step through the milestones and the year column slides to follow.

type Milestone = { year?: string; title?: string; text?: string };
type Data = { eyebrow: string; milestoneLabel: string; button: Link; milestones: Milestone[] };

// Figma: the current year's top is 404px into the 640px stage, each year 246px
// apart (line height + 10px). Below lg the years use the smaller number style
// (5rem line height), so the step and top are CSS variables that switch there.
const YEARS_POS = "[--year-step:15.375rem] max-lg:[--year-step:5.25rem]";

// Horizontal swipe (touch/pen) steps the milestones; vertical drags scroll.
const SWIPE_PX = 40;

// Warm glow bottom-right (Figma radial gradient, gold 22% → 0 at 60%).
const GLOW = "radial-gradient(42.2rem 54.1rem at 82.56% 91.34%, rgb(139 111 76 / 0.22), rgb(139 111 76 / 0))";

const yearLayer = "col-start-1 row-start-1 bg-linear-to-b bg-clip-text text-transparent transition-opacity duration-700 ease-out-soft motion-reduce:transition-none";

export default function Timeline({ data }: BlockProps<Data>) {
  const milestones = (data.milestones ?? []).filter((m) => m && (m.year || m.title || m.text));
  const total = milestones.length;
  const [current, setCurrent] = useState(0);
  const index = Math.min(current, Math.max(0, total - 1));
  const label = data.milestoneLabel ?? "Milestone";
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);

  const step = (dir: 1 | -1) => setCurrent(Math.min(total - 1, Math.max(0, index + dir)));
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" || total < 2) return;
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
  };

  return (
    <section aria-label={data.eyebrow || "Timeline"} className="relative bg-page py-section" style={{ backgroundImage: GLOW }}>
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
        className={`site-container relative h-[40rem] overflow-hidden [touch-action:pan-y_pinch-zoom] max-lg:flex max-lg:h-auto max-lg:flex-col max-lg:px-margin ${YEARS_POS}`}
      >
        {/* Big years (decorative: each year is also read out with its milestone) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none max-lg:relative max-lg:inset-auto max-lg:mt-8 max-lg:h-[13rem] max-lg:overflow-hidden">
          {milestones.map((m, i) => {
            const d = i - index; // >0 = later years, stacked above
            return (
              <div
                key={i}
                className="type-number-xl absolute top-[25.25rem] left-[13.1875rem] grid whitespace-nowrap transition-transform duration-700 ease-out-soft motion-reduce:transition-none max-lg:top-[8rem] max-lg:left-0"
                style={{ transform: `translateY(calc(${-d} * var(--year-step)))` }}
              >
                <span className={`${yearLayer} from-[rgb(139_111_76/0.5)] to-[#8b6f4c] ${d === 0 ? "opacity-100" : "opacity-0"}`}>{m.year}</span>
                <span className={`${yearLayer} from-[#1c1d1e] to-[#5a5d60] ${d === 1 ? "opacity-50" : "opacity-0"}`}>{m.year}</span>
                <span className={`${yearLayer} from-transparent to-[#2a2b2c] ${d >= 2 ? "opacity-40" : "opacity-0"}`}>{m.year}</span>
              </div>
            );
          })}
        </div>

        {/* Logo mark + eyebrow */}
        {data.eyebrow && (
          <div className="absolute top-[2.8125rem] left-margin flex items-center gap-3 max-lg:static max-lg:-order-1">
            <img src="/design/timeline/logo-mark.svg" alt="" width={22} height={18.8906} className="h-[1.1807rem] w-[1.375rem]" />
            <Eyebrow>{data.eyebrow}</Eyebrow>
          </div>
        )}

        {/* Milestone text: all stacked in one cell, the current one fades in */}
        {total > 0 && (
          <div aria-live="polite" className="absolute top-[12.75rem] left-[63.5625rem] grid w-[27.75rem] max-lg:static max-lg:mt-8 max-lg:w-full max-lg:max-w-[36rem]">
            {milestones.map((m, i) => {
              const active = i === index;
              return (
                <div
                  key={i}
                  inert={!active}
                  aria-hidden={!active}
                  className={`col-start-1 row-start-1 flex flex-col gap-4 transition-[opacity,translate] duration-500 ease-out-soft motion-reduce:transition-none ${
                    active ? "translate-y-0 opacity-100 delay-150" : "translate-y-3 opacity-0"
                  }`}
                >
                  <Eyebrow>{label}</Eyebrow>
                  {m.title && (
                    <h3 className="type-h3 text-ink">
                      {m.year && <span className="sr-only">{m.year}: </span>}
                      {m.title}
                    </h3>
                  )}
                  {m.text && <p className="type-body-l text-subtle">{m.text}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Button + slider controls, bottom-aligned to the stage */}
        <div className="absolute right-margin bottom-0 left-[63.5625rem] flex items-end justify-between gap-8 max-lg:static max-lg:mt-10 max-lg:flex-wrap max-lg:items-center max-lg:gap-6">
          <Button link={data.button} variant="secondary" />
          {total > 1 && (
            <SliderControls
              className="ml-auto"
              index={index}
              total={total}
              onPrev={() => step(-1)}
              onNext={() => step(1)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
