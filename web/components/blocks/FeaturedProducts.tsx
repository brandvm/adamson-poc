"use client";
/* eslint-disable @next/next/no-img-element */
// 02 Featured products (Figma 463:671): dark product-line slider. Each slide
// is a repeater item; the arrows/counter move between them and the top-right
// teaser shows (and jumps to) the next slide.
//
// Slide change: the incoming slide grows out of the "Next" thumbnail (or wipes
// in from the right edge; previous wipes in from the left) while its artwork
// settles from slightly larger to its place, the big word slides in and the
// text rises line by line. The outgoing slide drifts away, scales up a touch
// and dims. The product cut-out never moves sideways: it stays pinned at its
// centre and only scales. Scroll parallax: backdrop slower than the page, word
// drifts sideways, product scales to its original size as the section arrives. Static in the editor preview and under reduced motion.
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { gsap, reducedMotion } from "@/components/motion/gsap";
import { initialLayerStyle, useSlideTransition } from "@/components/motion/useSlideTransition";
import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import StudioBackdrop from "@/components/ui/StudioBackdrop";
import Button from "@/components/ui/Button";
import SliderControls from "@/components/ui/SliderControls";

type Slide = {
  name?: string;
  word?: string;
  logo?: Media;
  models?: string;
  background?: Media;
  product?: Media;
  thumbnail?: Media;
  description?: string;
  button?: Link;
  detailImage?: Media;
  detailLink?: string;
};
type Data = { nextLabel: string; slides: Slide[] };

// Artwork box from Figma: 2116 × 1258 at (-218, -130) inside the 1680 × 998 section.
const ART = "absolute left-[-13.625rem] top-[-8.125rem] h-[78.625rem] w-[132.25rem]";
// Below lg the section is a size container and the same box is sized in
// container units: 160% of the width (the product is ~51% of it, centred at
// 47% / 49%), product centre at 42% of the section height.
const ART_SM = "max-lg:left-[-25.2cqw] max-lg:top-[calc(42cqh_-_46.6cqw)] max-lg:w-[160cqw] max-lg:h-[95.1cqw]";
// The backdrop photo shares the product's box on small screens (the product is
// baked into it); its edges fade into the black section.
const BG_SM = "max-lg:[mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)]";
const SWIPE = 40; // px of horizontal travel that changes the slide

function SlideLayer({ slide, i, active, layerRef }: { slide: Slide; i: number; active: boolean; layerRef: (el: HTMLElement | null) => void }) {
  return (
    <div
      ref={layerRef}
      data-slide
      className="absolute inset-0 overflow-hidden"
      style={initialLayerStyle(i)}
      aria-hidden={!active}
      inert={!active}
    >
      {/* Backdrop + warm glow, bottom left. Outer: scroll parallax, inner: slide change. */}
      <div className={`${ART} ${ART_SM} ${BG_SM}`} data-scroll="bg" aria-hidden>
        <div className="absolute inset-0 will-change-transform" data-move="bg">
          {slide.background?.url ? (
            <Img media={slide.background} alt="" eager className="absolute inset-0 size-full object-cover object-bottom" />
          ) : (
            <StudioBackdrop tone="neutral" />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_72.6rem_at_5.8%_93.84%,rgb(139_111_76/0.32),rgb(139_111_76/0)_57.15%)]" />
        </div>
      </div>

      {/* Huge word between backdrop and product */}
      {slide.word && (
        <div className="absolute inset-x-0 top-[2.621rem] flex justify-center max-lg:top-14" data-scroll="word" aria-hidden>
          <p data-move="word" className="type-wordmark -ml-5 whitespace-nowrap max-lg:ml-0 max-lg:text-[17vw] text-center text-gold-50 opacity-70 mix-blend-soft-light will-change-transform">
            {slide.word}
          </p>
        </div>
      )}

      <div className={`${ART} ${ART_SM} pointer-events-none`} data-scroll="product">
        <div className="absolute inset-0 will-change-transform" data-move="product">
          <Img media={slide.product} eager className="absolute inset-0 size-full object-cover object-bottom" />
        </div>
      </div>

      {/* Dims the outgoing slide while the next one covers it */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black opacity-0" data-move="dim" />

      {/* Shades top and bottom keep the UI readable */}
      <div className="absolute inset-x-0 top-0 h-[26.25rem] bg-gradient-to-b from-black/72 to-black/0 max-lg:h-[35%]" />
      <div className="absolute inset-x-0 top-[38.75rem] h-[23.625rem] bg-gradient-to-b from-black/0 to-black/65 max-lg:top-auto max-lg:bottom-0 max-lg:h-[50%]" />

      {/* Below lg the text stacks at the bottom; the button shares its row with the slider controls. */}
      <div className="site-container relative z-[2] h-full max-lg:flex max-lg:flex-col max-lg:justify-end max-lg:gap-6 max-lg:px-margin max-lg:pb-7">
        {/* Logo + models */}
        <div className="absolute left-margin top-[26.75rem] flex flex-col items-start gap-2.5 max-lg:static" data-text>
          {slide.logo?.url ? (
            <Img media={slide.logo} eager alt={slide.logo.alt || slide.name || ""} className="h-[2.6523rem] w-auto" />
          ) : (
            slide.name && <h3 className="type-h4 text-ink">{slide.name}</h3>
          )}
          {slide.models && <p className="type-eyebrow text-muted">{slide.models}</p>}
        </div>

        {/* Description + button */}
        {(slide.description || slide.button?.label) && (
          <div className="absolute bottom-[3.125rem] left-margin flex max-w-[25rem] flex-col items-start gap-3.5 max-lg:static" data-text>
            {slide.description && <p className="type-body-xs text-muted">{slide.description}</p>}
            <Button link={slide.button} variant="contrast" />
          </div>
        )}

        {/* Detail card, bottom centre */}
        {slide.detailImage?.url && (
          <div className="absolute left-[43.75rem] top-[47.125rem] h-[15.25rem] w-[15rem] overflow-hidden rounded-t-md border max-lg:hidden border-line-subtle bg-gradient-to-b from-black to-[#161616]" data-text>
            <Img media={slide.detailImage} eager className="absolute inset-0 size-full object-cover" />
            {slide.detailLink && (
              <a
                href={slide.detailLink}
                aria-label={slide.name ? `View ${slide.name}` : "View product"}
                className="absolute left-1/2 top-[9.875rem] flex h-9 -translate-x-1/2 items-center justify-center rounded-full bg-white px-5 transition-colors duration-200 hover:bg-gold-50"
              >
                <img src="/design/featured-products/icon-plus.svg" alt="" width={12} height={12} className="size-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeaturedProducts({ data, preview }: BlockProps<Data>) {
  const slides = data.slides ?? [];
  const count = slides.length;
  const { section, index: current, layerRef, step } = useSlideTransition(count, { instant: preview });
  const thumb = useRef<HTMLSpanElement>(null);

  // Touch swipe: a mostly horizontal swipe changes the slide. The section is
  // `touch-pan-y`, so vertical swipes still scroll the page (the browser then
  // cancels the pointer and nothing happens here). Mouse drags are ignored.
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" || !e.isPrimary) return;
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || start.id !== e.pointerId) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) >= SWIPE && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
  };
  const onPointerCancel = () => (swipe.current = null);

  // Scroll parallax (all slides, so the incoming one matches the outgoing one).
  useEffect(() => {
    const el = section.current;
    if (!el || preview || reducedMotion()) return;
    const ctx = gsap.context(() => {
      const across = { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 };
      gsap.fromTo("[data-scroll='bg']", { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: across });
      gsap.fromTo("[data-scroll='word']", { xPercent: 4 }, { xPercent: -4, ease: "none", scrollTrigger: across });
      // The product stays pinned at its centre: it scales from slightly larger to
      // its original size as the section scrolls into view (no drift).
      gsap.fromTo(
        "[data-scroll='product']",
        { scale: 1.08 },
        { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: 0.8 } },
      );
    }, el);
    return () => ctx.revert();
  }, [preview, count, section]);

  if (!count) return null;
  const next = count > 1 ? slides[(current + 1) % count] : null;

  return (
    <section
      ref={section}
      className="relative h-[62.375rem] overflow-clip bg-page touch-pan-y touch-pinch-zoom max-lg:h-[40rem] max-lg:[container-type:size] md:max-lg:h-[56rem]"
      aria-roledescription="carousel"
      aria-label="Featured products"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* Slides in their own stacking group: however many reveals stack up during
          rapid clicks, they always stay below the controls. */}
      <div className="absolute inset-0 isolate">
        {slides.map((slide, i) => (
          <SlideLayer key={i} slide={slide} i={i} active={i === current} layerRef={layerRef(i)} />
        ))}
      </div>

      <div className="site-container pointer-events-none relative z-[3] h-full">
        {/* Next-slide teaser, top right. Tablets: above the controls; phones: hidden (arrows + swipe). */}
        {next && (
          <button
            type="button"
            onClick={() => step(1, thumb.current)}
            className="group pointer-events-auto absolute right-margin top-[26.75rem] flex flex-col items-end gap-3.5 text-right max-md:hidden max-lg:top-auto max-lg:bottom-[6.5rem]"
          >
            <span className="flex flex-col items-end">
              {next.name && <span className="type-eyebrow text-ink">{next.name}</span>}
              <span className="flex items-center gap-1.5">
                <span className="type-eyebrow text-muted transition-colors duration-200 group-hover:text-ink">{data.nextLabel || "Next"}</span>
                <img src="/design/featured-products/icon-next.svg" alt="" width={12} height={12} className="size-3" />
              </span>
            </span>
            {next.thumbnail?.url && (
              <span ref={thumb} className="relative block h-24 w-[9.375rem] overflow-hidden rounded-sm border border-line-subtle">
                <Img media={next.thumbnail} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-105 motion-reduce:transition-none" />
              </span>
            )}
          </button>
        )}

        <SliderControls
          index={current}
          total={count}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          loop
          className="pointer-events-auto absolute bottom-[3.125rem] right-margin max-lg:bottom-6"
        />
      </div>
    </section>
  );
}
