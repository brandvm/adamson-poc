"use client";
// 03 Products (Figma 525:9912): light section with a header, type filter pills
// and a horizontally scrolling track (count card + product tiles). The pills
// filter the tiles by type; the header arrows scroll the track one tile.
// The track runs edge to edge (its first card lines up with the page margin).
// Filtering animates in the row itself: a removed tile shrinks to nothing while
// it fades (its neighbours slide in to close the gap), an added tile opens up in
// place. The tile's content is clipped while it resizes, never squashed.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, reducedMotion } from "@/components/motion/gsap";
import type { BlockProps, Link, Product } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import { SliderArrows } from "@/components/ui/SliderControls";
import CountUp from "@/components/motion/CountUp";

// Same order as the "type" select in contract/blocks/03-product-range.json.
const TYPES = ["Line Source", "Point Source", "Subwoofer", "Stage Monitor"];

// The cards are the Products records marked "Show in the Products section"
// (WordPress → Products), in their Order; they arrive as extras.products.
type Data = {
  eyebrow: string;
  title: string;
  description: string;
  allLabel: string;
  count: { label?: string; value?: string; button?: Link };
};

function CountCard({ count }: { count?: Data["count"] }) {
  if (!count?.value && !count?.label) return null;
  return (
    <div data-flip-id="count" className="relative h-[28.75rem] w-[21.25rem] shrink-0 snap-start overflow-hidden rounded-lg bg-black max-lg:h-[calc(var(--card-w)*460/540)] max-lg:w-[calc(var(--card-w)*340/540)] bg-[radial-gradient(circle_27.25rem_at_100%_2.59rem,rgb(139_111_76/0.42),rgb(139_111_76/0)_57.15%)]">
      {count.label && <p className="type-body-s absolute left-7 top-7 text-muted max-lg:inset-x-5 max-lg:top-5">{count.label}</p>}
      {count.value && <CountUp value={count.value} className="type-number-l absolute left-6 top-[9.375rem] whitespace-nowrap text-ink max-lg:left-4 max-lg:top-1/2 max-lg:-translate-y-1/2" />}
      <div className="absolute left-7 top-[24.6875rem] max-lg:left-5 max-lg:top-auto max-lg:bottom-5">
        <Button link={count.button} variant="secondary" />
      </div>
    </div>
  );
}

function ProductCard({ product, flipId }: { product: Product; flipId: string }) {
  const Tag = product.url ? "a" : "div";
  return (
    <Tag
      {...(product.url ? { href: product.url } : {})}
      data-card
      data-flip-id={flipId}
      data-type={product.type ?? ""}
      className="group relative h-[28.75rem] w-[33.75rem] shrink-0 snap-start overflow-hidden rounded-lg bg-card max-lg:h-[calc(var(--card-w)*460/540)] max-lg:w-[var(--card-w)]"
    >
      {/* Fixed width (the tile's full width): when the tile shrinks during filtering its
          content is clipped, not squashed. The filter animation reads this width. */}
      <div data-tile-inner className="absolute inset-y-0 left-0 w-[33.75rem] origin-left max-lg:w-[var(--card-w)]">
      <Img
        media={product.render}
        alt={product.render?.alt || product.name || ""}
        className="absolute inset-0 size-full object-fill transition-transform duration-700 ease-out-soft group-hover:scale-[1.03] motion-reduce:transition-none"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_23.75rem_28.75rem_at_0%_100%,rgb(139_111_76/0.72),rgb(139_111_76/0)_57.15%)]" />
      <div className="absolute inset-x-0 top-0 h-[7.5rem] bg-gradient-to-b from-black/45 to-black/0" />
      <div className="absolute inset-x-0 bottom-0 h-[12.5rem] bg-gradient-to-b from-black/0 to-black/85" />

      <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-4 max-lg:inset-x-5 max-lg:top-5">
        {product.type && (
          <span className="type-tag rounded-full border border-line bg-glass px-3 py-[0.4375rem] text-ink backdrop-blur-[5px]">{product.type}</span>
        )}
        {product.series && <span className="type-body-s ml-auto whitespace-nowrap text-subtle">{product.series}</span>}
      </div>

      <div className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-4 whitespace-nowrap max-lg:inset-x-5 max-lg:bottom-5">
        <div className="flex flex-col gap-1">
          {product.name && <h3 className="type-h4 text-ink">{product.name}</h3>}
          {product.range && <p className="type-body-s text-subtle">{product.range}</p>}
        </div>
        {product.spl && (
          <div className="flex flex-col items-end gap-0.5 text-right">
            <p className="type-h5 text-ink">{product.spl}</p>
            {product.splLabel && <p className="type-body-xs text-subtle">{product.splLabel}</p>}
          </div>
        )}
      </div>
      </div>
    </Tag>
  );
}

// Page margin, measured from the 1680px container's edge on wider screens.
const GUTTER = "max(var(--spacing-margin), calc((100vw - 105rem) / 2 + var(--spacing-margin)))";

const pill = "type-button inline-flex h-9 items-center max-lg:shrink-0 justify-center whitespace-nowrap rounded-full px-4 transition-colors duration-200";

export default function ProductRange({ data, extras }: BlockProps<Data>) {
  const products = (extras?.products ?? []).filter((p) => p.inRange);
  const types = TYPES.filter((t) => products.some((p) => p.type === t));
  const [filter, setFilter] = useState<string | null>(null);

  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);

  const behavior = (): ScrollBehavior =>
    matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  const step = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const gap = parseFloat(getComputedStyle(el.firstElementChild as Element).columnGap) || 0;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? el.clientWidth / 2) + gap), behavior: behavior() });
  };

  const choose = (t: string | null) => {
    if (t === filter) return;
    const el = scroller.current;
    // Snapping would fight the tiles resizing: pause it while they animate.
    if (el) {
      el.style.scrollSnapType = "none";
      window.setTimeout(() => (el.style.scrollSnapType = ""), 900);
    }
    setFilter(t);
    el?.scrollTo({ left: 0, behavior: behavior() });
  };

  // Show/hide tiles for the current filter. React renders every tile; GSAP owns
  // their display/size so a tile can animate out or in within the row.
  const firstRun = useRef(true);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const tiles = [...el.querySelectorAll<HTMLElement>("[data-card]")];
    const instant = firstRun.current || reducedMotion();
    firstRun.current = false;
    const GAP = "-1rem"; // cancels the flex gap of a collapsed tile

    tiles.forEach((tile) => {
      const show = !filter || tile.dataset.type === filter;
      const inner = tile.querySelector<HTMLElement>("[data-tile-inner]");
      const isHidden = getComputedStyle(tile).display === "none";
      if (instant) {
        gsap.set(tile, show ? { clearProps: "display,width,marginRight,opacity" } : { display: "none" });
        return;
      }
      if (show && (isHidden || tile.dataset.leaving)) {
        // Open up in place.
        delete tile.dataset.leaving;
        if (isHidden) gsap.set(tile, { display: "", width: 0, marginRight: GAP, opacity: 0 });
        // Full width = the inner box's fixed width (33.75rem on desktop, --card-w below lg).
        const width = inner?.offsetWidth || "33.75rem";
        gsap.to(tile, { width, marginRight: 0, opacity: 1, duration: 0.7, ease: "power3.inOut", overwrite: "auto", clearProps: "width,marginRight,opacity" });
        if (inner) gsap.fromTo(inner, { scale: 0.92 }, { scale: 1, duration: 0.8, ease: "power3.out", overwrite: "auto", clearProps: "transform" });
      } else if (!show && !isHidden && !tile.dataset.leaving) {
        // Shrink out of the row; neighbours slide in to close the gap.
        tile.dataset.leaving = "1";
        gsap.to(tile, {
          width: 0,
          marginRight: GAP,
          opacity: 0,
          duration: 0.6,
          ease: "power3.inOut",
          overwrite: "auto",
          onComplete: () => {
            delete tile.dataset.leaving;
            gsap.set(tile, { display: "none", clearProps: "width,marginRight,opacity" });
          },
        });
        if (inner) gsap.to(inner, { scale: 0.92, duration: 0.6, ease: "power3.inOut", overwrite: "auto" });
      }
    });
  }, [filter]);

  return (
    <section className="bg-white py-section text-black">
      <div className="site-container">
        <div className="flex flex-col gap-8 px-margin">
          <SectionHeader
            eyebrow={data.eyebrow}
            title={data.title}
            description={data.description}
            tone="light"
            action={<SliderArrows tone="light" onPrev={() => step(-1)} onNext={() => step(1)} canPrev={!edges.start} canNext={!edges.end} />}
          />
          {types.length > 1 && (
            <div className="no-scrollbar flex flex-wrap gap-2 max-lg:-mx-margin max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:px-margin" role="group" aria-label="Filter by type">
              <button type="button" aria-pressed={filter === null} onClick={() => choose(null)} className={`${pill} ${filter === null ? "bg-black text-white" : "border border-black/14 text-black hover:bg-black/5"}`}>
                {data.allLabel || "All"}
              </button>
              {types.map((t) => (
                <button key={t} type="button" aria-pressed={filter === t} onClick={() => choose(t)} className={`${pill} ${filter === t ? "bg-black text-white" : "border border-black/14 text-black hover:bg-black/5"}`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Full-bleed track: runs to both screen edges; the first tile lines up with the page margin. */}
      {/* Below lg the tiles are --card-w wide (~80vw); heights keep the desktop proportions. */}
      <div ref={scroller} className="no-scrollbar mt-16 snap-x snap-mandatory overflow-x-auto max-lg:mt-10 max-lg:[--card-w:min(80vw,30rem)]" style={{ scrollPaddingLeft: GUTTER }}>
        <div className="relative flex w-max gap-4" style={{ paddingInline: GUTTER }}>
          <CountCard count={data.count} />
          {products.map((p, i) => (
            <ProductCard key={p.id} flipId={`p${i}`} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
