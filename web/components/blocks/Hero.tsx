"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import type { BlockProps, Link, Media } from "@/lib/types";
import Button from "@/components/ui/Button";
import Img from "@/components/ui/Img";
import StudioBackdrop, { ProductShadow } from "@/components/ui/StudioBackdrop";
import Marquee from "@/components/motion/Marquee";
import { gsap, reducedMotion } from "@/components/motion/gsap";

type Data = {
  heading: string;
  primary: Link;
  secondary: Link;
  background: Media;
  product: Media;
  artists: { name?: string }[];
};

// Figma 463:629 — gold glow top-left and grey glow top-right over the background.
// Where the product image is split so the wordmark can pass between its halves
// (in front of the left part, behind the right part). One line for both halves:
// Figma's two masks left an 18px strip uncovered, which showed as a seam.
// A share of the artwork box (963 of its 1660px = 60.1875rem on desktop) so the
// split stays on the same line when the box is resized for small screens.
const SPLIT = "calc(100% * 963 / 1660)";

// Below lg the card is a size container and the artwork box is sized and placed
// in container units so the whole speaker shows on any card shape:
// --aw = box width (the speaker is ~62% of it), --yc = speaker centre height.
// In the 1660 × 931 box the speaker's centre sits at 61.6% / 52.5%.
const ART_SM =
  "max-lg:left-[calc(50cqw_-_0.616_*_var(--aw))] max-lg:top-[calc(var(--yc)_-_0.2944_*_var(--aw))] max-lg:w-[var(--aw)] max-lg:h-[calc(var(--aw)_*_0.5608)]";

const GLOWS =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1660 930.9' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(68 79.1 107.91 -123.45 56 89)'><stop stop-color='rgba(139,111,76,0.32)' offset='0'/><stop stop-color='rgba(139,111,76,0)' offset='0.57153'/></radialGradient></defs></svg>\"), url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1660 930.9' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='0.4000000059604645'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-82.25 80.65 -143.82 -146.67 1545 28)'><stop stop-color='rgba(91,90,95,1)' offset='0'/><stop stop-color='rgba(91,90,95,0)' offset='0.6992'/></radialGradient></defs></svg>\")";

/**
 * 01 Hero (Figma 463:597). A rounded card with background + product image;
 * the ADAMSON wordmark passes in front of the product's left half and behind
 * its right half (Figma splits the image the same way). Artist strip below.
 */
export default function Hero({ data, preview }: BlockProps<Data>) {
  const card = useRef<HTMLDivElement>(null);

  // Scroll parallax: the product rises faster than the page and grows a little,
  // the background drifts slower. Both product halves move together so the
  // wordmark split holds.
  useEffect(() => {
    const el = card.current;
    if (!el || preview || reducedMotion()) return;
    const ctx = gsap.context(() => {
      const product = el.querySelectorAll("[data-parallax='product']");
      const bg = el.querySelectorAll("[data-parallax='background']");
      const scroll = { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 };
      gsap.fromTo(product, { yPercent: 0, scale: 1 }, { yPercent: -12, scale: 1.06, ease: "none", scrollTrigger: scroll });
      gsap.fromTo(bg, { yPercent: 0 }, { yPercent: 8, ease: "none", scrollTrigger: scroll });

    }, el);
    return () => ctx.revert();
  }, [preview]);

  const artists = (data.artists ?? []).map((a) => a?.name).filter(Boolean) as string[];
  // The card sits 20px in from the edges; artwork layers are positioned like Figma's
  // 1660 × 931 image at (-20, -30) relative to the card.
  const art = "absolute left-[-1.25rem] top-[-1.875rem] h-[58.1875rem] w-[103.75rem]";

  return (
    <section className="bg-page">
      <div className="site-container">
        <div
          ref={card}
          className="relative mx-5 h-[53.1875rem] overflow-hidden rounded-[1.25rem] bg-black max-lg:h-[min(36rem,85svh)] max-lg:[container-type:size] max-lg:[--aw:min(142cqw,120cqh)] max-lg:[--yc:40cqh] md:max-lg:h-[min(48rem,80svh)]"
        >
          {/* Background + glows */}
          {/* Background: the editor's image, or the studio backdrop recreated in CSS
              (oversized so the parallax never shows an edge). */}
          {/* Below lg this box steps aside (static) so the backdrop and glows fill the card. */}
          <div className={`${art} max-lg:static`}>
            <div className="absolute inset-x-0 -inset-y-[12%] will-change-transform" data-parallax="background">
              {data.background?.url ? (
                <Img media={data.background} eager className="absolute inset-0 size-full object-cover" />
              ) : (
                <StudioBackdrop tone="warm" />
              )}
            </div>
            <div className="absolute inset-0" style={{ backgroundImage: GLOWS }} />
            {/* Contact shadow, moves with the product */}
            {data.product?.url && (
              <div className={`absolute inset-0 will-change-transform max-lg:right-auto max-lg:bottom-auto ${ART_SM}`} data-parallax="product">
                <ProductShadow className="left-[30%] top-[70%] h-[9%] w-[58%]" />
              </div>
            )}
          </div>

          {/* Product, left half (behind the wordmark) */}
          {data.product?.url && (
            <div className={`${art} ${ART_SM}`} style={{ clipPath: `inset(0 calc(100% - ${SPLIT} - 1px) 0 0)` }}>
              <Img media={data.product} eager className="absolute left-0 top-[-0.1%] h-[100.18%] w-full will-change-transform" data-parallax="product" />
            </div>
          )}

          {/* Wordmark (decorative). Below lg: card width, crossing the speaker's lower part as on desktop. */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-[17.28rem] w-[102.5rem] max-lg:bottom-auto max-lg:top-[calc(var(--yc)_+_0.1767_*_var(--aw)_-_10.8cqw)] max-lg:aspect-[1640/277] max-lg:h-auto max-lg:w-full"
            aria-hidden
          >
            <img src="/design/hero/wordmark-1.svg" alt="" className="absolute inset-0 size-full mix-blend-soft-light" />
            <img src="/design/hero/wordmark-2.svg" alt="" className="absolute inset-0 size-full" />
            <img src="/design/hero/wordmark-3.svg" alt="" className="absolute inset-0 size-full mix-blend-soft-light" />
          </div>

          {/* Product, right half (in front of the wordmark) */}
          {data.product?.url && (
            <div className={`${art} ${ART_SM}`} style={{ clipPath: `inset(0 0 0 ${SPLIT})` }}>
              <Img media={data.product} alt="" eager className="absolute left-0 top-[-0.1%] h-[100.18%] w-full will-change-transform" data-parallax="product" />
            </div>
          )}

          {/* Bottom fade */}
          <div className="absolute left-[-1.25rem] top-[37.875rem] h-[15.3125rem] w-[103.75rem] bg-gradient-to-b from-transparent to-black/80 max-lg:inset-x-0 max-lg:top-auto max-lg:bottom-0 max-lg:h-[45%] max-lg:w-auto" />

          {/* Copy */}
          <div className="absolute left-12 top-[22.5625rem] flex w-[28.3125rem] flex-col gap-[2.125rem] max-lg:inset-x-6 max-lg:top-auto max-lg:bottom-6 max-lg:w-auto max-lg:max-w-[32rem] max-lg:gap-5">
            {data.heading && <h1 className="type-h5 text-ink md:max-lg:type-h4">{data.heading}</h1>}
            {(data.primary?.label || data.secondary?.label) && (
              <div className="flex gap-4 max-lg:flex-wrap max-lg:gap-3">
                <Button link={data.primary} variant="primary" />
                <Button link={data.secondary} variant="secondary" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Artist strip */}
      {artists.length > 0 && (
        <div className="relative mt-8 h-24 overflow-hidden border-y border-line-subtle py-8 max-lg:mt-6 max-lg:h-20 max-lg:py-6">
          <Marquee speed={40} still={preview} className="gap-16 pr-16">
            {artists.map((name, i) => (
              <span key={i} className="type-marquee whitespace-nowrap text-muted">{name}</span>
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-8 left-0 w-[8.9375rem] bg-gradient-to-r from-black to-transparent max-lg:inset-y-6 max-lg:w-12" />
          <div className="pointer-events-none absolute inset-y-8 right-0 w-[8.9375rem] bg-gradient-to-l from-black to-transparent max-lg:inset-y-6 max-lg:w-12" />
        </div>
      )}
    </section>
  );
}
