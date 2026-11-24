import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import ArrowLink from "@/components/ui/ArrowLink";

// 05 Applications (Figma 463:871): two tall photo cards. Each card stacks
// background photo → huge layered word → foreground cut-out → shade → label row,
// so the cut-out (performer, speaker stack) overlaps the word.
// Below lg: cards stack (2 columns on tablets) with a 4:5 shape; the word's SVG
// scales with the card width.

type Tint = "cool" | "warm";
type Card = { word: string; label: string; link: Link; background: Media; foreground: Media; tint: Tint };
type Data = { cards: Card[] };

// Figma: three stacked copies of the word: soft-light white, a 20% tint, soft-light white.
const tints: Record<Tint, { light: string; tint: string }> = {
  cool: { light: "rgb(255 255 255 / 0.6)", tint: "rgb(86 78 129 / 0.2)" },
  warm: { light: "rgb(255 255 255)", tint: "rgb(158 88 55 / 0.2)" },
};

/**
 * The word is stretched (letter-spacing) to the card's width, like the design
 * (TOURING is tight, INSTALL is loose). SVG units = design px of a 764px card.
 */
function Word({ word, tint }: { word: string; tint: Tint }) {
  const t = tints[tint] ?? tints.cool;
  const layers: { fill: string; blend?: boolean }[] = [
    { fill: t.light, blend: true },
    { fill: t.tint },
    { fill: t.light, blend: true },
  ];
  return (
    <>
      {layers.map((layer, i) => (
        <svg
          key={i}
          aria-hidden
          viewBox="0 0 764 150"
          className={`pointer-events-none absolute inset-x-0 top-0 w-full ${layer.blend ? "mix-blend-soft-light" : ""}`}
        >
          <text
            x="12"
            y="126"
            textLength="740"
            lengthAdjust="spacing"
            fontSize="175.44"
            fill={layer.fill}
            className="font-normal"
          >
            {word}
          </text>
        </svg>
      ))}
    </>
  );
}

function ApplicationCard({ card }: { card: Partial<Card> }) {
  const href = card.link?.url || undefined;
  const name = card.label || card.word || card.link?.label || "Open";
  return (
    <article className="group relative isolate h-[48.125rem] overflow-clip rounded-lg bg-raised max-lg:aspect-[4/5] max-lg:h-auto max-lg:rounded-md">
      <Img
        media={card.background}
        className="absolute inset-0 size-full object-cover object-bottom transition-transform duration-700 ease-out-soft motion-safe:group-hover:scale-[1.03]"
      />
      {card.word && <Word word={card.word} tint={card.tint ?? "cool"} />}
      <Img
        media={card.foreground}
        className="absolute inset-0 size-full object-cover object-bottom transition-transform duration-700 ease-out-soft motion-safe:group-hover:scale-[1.03]"
      />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_34.6%,rgb(0_0_0/0.7)_91.1%)]" />

      {/* Whole card clicks through; the arrow is the accessible link. */}
      {href && <a href={href} aria-hidden tabIndex={-1} className="absolute inset-0 z-10" />}

      <div className="pointer-events-none absolute inset-x-8 bottom-8 z-20 flex items-center justify-between gap-6 max-lg:inset-x-5 max-lg:bottom-5 max-lg:gap-4">
        {card.label && <h3 className="type-h4 text-ink">{card.label}</h3>}
        {href && <ArrowLink href={href} label={name} className="pointer-events-auto ml-auto" />}
      </div>
    </article>
  );
}

export default function Applications({ data }: BlockProps<Data>) {
  const cards = (data.cards ?? []).filter(Boolean);
  if (!cards.length) return null;
  return (
    <section className="bg-page">
      <div className={`site-container grid gap-4 px-margin py-section ${cards.length > 1 ? "grid-cols-2 max-lg:grid-cols-1 md:max-lg:grid-cols-2" : "grid-cols-1"}`}>
        {cards.map((card, i) => (
          <ApplicationCard key={i} card={card} />
        ))}
      </div>
    </section>
  );
}
