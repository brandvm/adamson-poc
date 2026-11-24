import type { CSSProperties } from "react";
import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeader";

// Page Hero (Figma Products Overview 507:1246): a rounded photo panel with
// left/bottom shades, a large soft-light wordmark along the bottom, eyebrow,
// H5 title and a primary button; under it a strip of anchor links to the
// page's sections. Below lg the panel is shorter and the strip becomes a 2×2
// grid (phones) so nothing scrolls sideways.

type Anchor = { label: string; meta: string; url: string };
type Data = {
  eyebrow: string;
  heading: string;
  button: Link;
  wordmark: string;
  background: Media;
  overlay: Media;
  anchors: Anchor[];
};

export default function PageHero({ data }: BlockProps<Data>) {
  const anchors = (data.anchors ?? []).filter((a) => a?.label);
  const word = data.wordmark?.trim();
  return (
    <section className="bg-page">
      <div className="site-container px-5 max-lg:px-3">
        <div className="relative h-[47.5rem] overflow-clip rounded-lg bg-raised max-lg:h-[36rem] max-md:h-[32rem]">
          {/* The overlay (cut-out cabinets) is partly transparent: in Figma it sits on a dark fill, so the
              background photo is only used when no overlay is set. */}
          {data.overlay?.url ? (
            <div className="absolute inset-0 bg-black">
              <Img media={data.overlay} eager alt="" className="absolute inset-0 size-full object-cover" />
            </div>
          ) : (
            <Img media={data.background} eager className="absolute inset-0 size-full object-cover" />
          )}

          {word && (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[-0.625rem] flex justify-center whitespace-nowrap">
              {/* Shrinks for longer words so the whole word fits (Figma: 18.5rem for 8 letters). */}
              <div
                className="relative type-wordmark !text-[min(18.5rem,calc(102rem/var(--len)))] max-lg:!text-[min(16vw,calc(94vw/var(--len)))]"
                style={{ "--len": word.length * 0.675 } as CSSProperties}
              >
                <span className="text-white mix-blend-soft-light">{word}</span>
                <span className="absolute inset-0 text-[rgb(215_215_215/0.2)]">{word}</span>
                <span className="absolute inset-0 text-white opacity-40 mix-blend-soft-light">{word}</span>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/20 via-55% to-transparent max-md:from-black/80 max-md:via-black/50" />
          <div className="absolute inset-x-0 bottom-0 h-[23.75rem] bg-linear-to-b from-transparent to-black/90" />

          <div className="absolute top-[15.625rem] left-12 flex w-[32.5rem] flex-col gap-6 max-lg:inset-x-5 max-lg:top-auto max-lg:bottom-[30%] max-lg:w-auto">
            <Eyebrow>{data.eyebrow}</Eyebrow>
            {data.heading && <h1 className="type-h5 max-w-[27.5rem] text-ink">{data.heading}</h1>}
            <div className="pt-2.5">
              <Button link={data.button} variant="primary" />
            </div>
          </div>
        </div>
      </div>

      {anchors.length > 0 && (
        <nav aria-label="On this page" className="site-container px-margin py-8">
          <ul className="flex items-center justify-between gap-6 max-lg:grid max-lg:grid-cols-2 max-lg:gap-x-4 max-lg:gap-y-5">
            {anchors.map((a) => (
              <li key={a.label}>
                <a href={a.url || "#"} className="group flex items-baseline gap-3 whitespace-nowrap max-md:flex-col max-md:gap-0.5">
                  <span className="type-marquee text-ink transition-colors group-hover:text-accent">{a.label}</span>
                  {a.meta && <span className="type-body-s text-muted">{a.meta}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
