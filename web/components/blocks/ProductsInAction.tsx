"use client";
/* eslint-disable @next/next/no-img-element */
// 04 Products in action (Figma 463:767): one slide per product, each with its
// own full-bleed photo of the product in use and a heading. Each slide points
// to a Products record (WordPress → Products), which supplies the card's name,
// logo, cut-out and link. The row of glass product cards is the navigation: clicking a card grows its slide out of the
// card; the arrows wipe in from the side; rapid clicks ripple. Same transition
// as Featured products (components/motion/useSlideTransition).
//
// Below lg: the cards become a horizontal swipe row, the eyebrow moves into each
// slide (above its heading, so long headings can't overlap it), the counter and
// arrows sit on their own row, and a horizontal swipe on the photo changes slide.
import { useEffect, useRef } from "react";
import type { BlockProps, Media, Product } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import SliderControls from "@/components/ui/SliderControls";
import { initialLayerStyle, useSlideTransition } from "@/components/motion/useSlideTransition";

type SlideData = { product?: number | null; title?: string; background?: Media };
type Data = { eyebrow: string; buttonLabel: string; slides: SlideData[] };
type Slide = SlideData & { item?: Product };

const MAX_CARDS = 6;

function ProductCard({ slide, buttonLabel, active, onSelect }: { slide: Slide; buttonLabel: string; active: boolean; onSelect: (el: HTMLElement) => void }) {
  const p = slide.item;
  const name = p?.name;
  return (
    <div
      data-card
      className={`relative flex h-[11.9375rem] min-w-0 flex-1 flex-col max-lg:h-[10.5rem] max-lg:w-[42vw] max-lg:flex-none max-lg:snap-start md:max-lg:w-[30vw] justify-between overflow-hidden rounded-md border bg-glass bg-[radial-gradient(ellipse_9.2rem_20.1rem_at_82.56%_91.34%,rgb(139_111_76/0.22),rgb(139_111_76/0)_60%)] backdrop-blur-[16px] transition-[border-color,background-color] duration-500 ${
        active ? "border-accent/70 bg-black/45" : "border-line-subtle hover:border-line"
      }`}
    >
      {/* Whole card selects the slide; the Explore button keeps its own link. */}
      <button
        type="button"
        aria-label={name ? `Show ${name} in action` : "Show product in action"}
        aria-pressed={active}
        onClick={(e) => onSelect(e.currentTarget.parentElement as HTMLElement)}
        className="absolute inset-0 z-[1] cursor-pointer"
      />
      <div className="pointer-events-none relative h-[8.5rem] w-full shrink-0 overflow-hidden max-lg:h-[7rem]">
        <Img media={p?.cutout} alt={p?.cutout?.alt || name || ""} className="absolute left-0 top-[0.625rem] h-[10.1875rem] w-full object-cover max-lg:top-[0.5rem] max-lg:h-[8.5rem]" />
      </div>
      <div className="relative z-[2] flex justify-center p-2">
        {p?.url && <Button label={buttonLabel} href={p.url} variant="secondary" />}
      </div>
      <div className="pointer-events-none absolute left-4 top-4 flex h-6 items-center">
        {p?.logo?.url ? (
          <Img media={p.logo} alt={p.logo.alt || name || ""} className="h-6 w-[4.4375rem] object-contain object-left" />
        ) : (
          name && (
            <span className="flex items-center gap-[0.3125rem]">
              <img src="/design/products-in-action/adamson-mark.svg" alt="" width={22} height={20} className="h-[1.2241rem] w-[1.3857rem]" />
              <span className="type-body-l whitespace-nowrap font-medium leading-none tracking-[-0.01em] text-ink">{name}</span>
            </span>
          )
        )}
      </div>
    </div>
  );
}

export default function ProductsInAction({ data, extras, preview }: BlockProps<Data>) {
  const byId = new Map((extras?.products ?? []).map((p) => [p.id, p]));
  const slides: Slide[] = (data.slides ?? []).slice(0, MAX_CARDS).map((s) => ({ ...s, item: s.product ? byId.get(s.product) : undefined }));
  const buttonLabel = data.buttonLabel || "Explore Product";
  const count = slides.length;
  const { section, index: current, layerRef, step, goTo } = useSlideTransition(count, { instant: preview });
  const row = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);

  // Small screens: keep the active card in view in the swipe row (no-op when
  // the row doesn't scroll, i.e. on desktop).
  useEffect(() => {
    const el = row.current;
    const card = el?.children[current] as HTMLElement | undefined;
    if (!el || !card || el.scrollWidth <= el.clientWidth) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const start = card.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft; // in scroll content
    const visible = start >= el.scrollLeft + pad - 1 && start + card.offsetWidth <= el.scrollLeft + el.clientWidth - pad + 1;
    if (!visible) el.scrollTo({ left: start - pad, behavior: "smooth" });
  }, [current]);

  if (!count) return null;

  // Touch swipe on the photo: horizontal moves change slide; vertical moves are
  // left to the page (touch-action: pan-y, which cancels the pointer).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
  };
  const onPointerCancel = () => {
    swipe.current = null;
  };

  return (
    <section ref={section} className="relative h-[58rem] overflow-clip bg-page max-lg:h-[44rem] md:max-lg:h-[52rem]" aria-roledescription="carousel" aria-label={data.eyebrow || "Products in action"}>
      {/* One layer per product: photo + shades + heading. Own stacking group, so
          reveals stacking up during rapid clicks always stay below the controls. */}
      <div className="absolute inset-0 isolate touch-pan-y" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}>
      {slides.map((s, i) => (
        <div
          key={i}
          ref={layerRef(i)}
          className="absolute inset-0 overflow-hidden"
          style={initialLayerStyle(i)}
          aria-hidden={i !== current}
        >
          <div className="absolute inset-0 will-change-transform" data-move="bg">
            <Img media={s.background} alt={s.background?.alt || ""} eager className="absolute inset-0 size-full object-cover" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_38.7rem_at_92.95%_91.2%,rgb(0_0_0/0.4),rgb(0_0_0/0))]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0)_28.718%,rgb(0_0_0/0.8)_90.787%)]" />
          <div className="pointer-events-none absolute inset-0 bg-black opacity-0" data-move="dim" />
          {/* Heading sits where the header row's title slot is. Below lg it sits
              just above the controls row (1.5 + 1px + 1.5 + 10.5 card + 1.5 +
              2.75 arrows + 1.25 gap = 19.0625rem) and grows upwards, with the
              eyebrow above it. */}
          <div className="site-container relative h-full">
            <div className="absolute bottom-[19.125rem] left-margin w-[47.5rem] max-lg:right-margin max-lg:bottom-[19.0625rem] max-lg:flex max-lg:w-auto max-lg:flex-col max-lg:gap-3" data-text>
              {data.eyebrow && <p className="type-eyebrow text-accent lg:hidden">{data.eyebrow}</p>}
              {s.title && <h2 className="type-h3 text-ink">{s.title}</h2>}
            </div>
          </div>
        </div>
      ))}
      </div>

      {/* Navigation: eyebrow, counter + arrows, product cards, progress */}
      <div className="site-container pointer-events-none relative z-[1] h-full">
        <div className="absolute inset-x-0 bottom-[3.125rem] flex flex-col gap-8 px-margin max-lg:bottom-6 max-lg:gap-6">
          <div className="flex items-end justify-between gap-8 max-lg:gap-0">
            <div className="flex w-[47.5rem] flex-col items-start gap-4 max-lg:w-0 max-lg:gap-0">
              {data.eyebrow && <p className="type-eyebrow text-accent max-lg:hidden">{data.eyebrow}</p>}
              <div className="h-[2.875rem] max-lg:h-0" aria-live="polite">
                <span className="sr-only">{slides[current]?.title}</span>
              </div>
            </div>
            <SliderControls index={current} total={count} onPrev={() => step(-1)} onNext={() => step(1)} loop className="pointer-events-auto max-lg:flex-1 max-lg:justify-between" />
          </div>

          <div ref={row} className="no-scrollbar pointer-events-auto flex gap-4 max-lg:-mx-margin max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-margin max-lg:overflow-x-auto max-lg:px-margin max-lg:gap-3">
            {slides.map((s, i) => (
              <ProductCard key={i} slide={s} buttonLabel={buttonLabel} active={i === current} onSelect={(el) => goTo(i, el)} />
            ))}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-label={s.item?.name ? `Show ${s.item.name}` : `Show slide ${i + 1}`}
                aria-current={i === current}
                onClick={() => goTo(i)}
                className="group -my-2 flex-1 py-2"
              >
                <span className={`block h-px w-full transition-colors duration-500 ${i === current ? "bg-gold" : "bg-line group-hover:bg-white/40"}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
