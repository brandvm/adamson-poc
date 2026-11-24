import type { CSSProperties } from "react";
import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import ArrowLink from "@/components/ui/ArrowLink";
import SectionHeader from "@/components/ui/SectionHeader";
import CountUp from "@/components/motion/CountUp";

// 07 Why Adamson (Figma 463:922): stacked "Section header" (H2) on the left,
// 2 × 2 grid of "Card / Stat" on the right. Card backgrounds: photo + overlay,
// raised (solid grey) or glow (black with a gold radial glow bottom-left).
// Below lg: header above the cards; cards 1 column on phones, 2 on tablets.

type Background = "image" | "raised" | "glow";
type Stat = { number: string; title: string; description: string; link: Link; background: Background; image: Media };
type Data = { eyebrow: string; heading: string; description: string; button: Link; stats: Stat[] };

const sectionGlow: CSSProperties = {
  backgroundImage: "radial-gradient(75rem 65rem at 3rem calc(100% - 2.625rem), rgb(139 111 76 / 0.22), transparent 60%)",
};
const cardGlow: CSSProperties = {
  backgroundImage: "radial-gradient(28rem 30rem at 10% 93%, rgb(139 111 76 / 0.32), transparent 60%)",
};
const photoOverlay: CSSProperties = {
  backgroundImage: [
    "linear-gradient(209deg, rgb(0 0 0 / 0.7) 11.4%, transparent 66.3%)",
    "linear-gradient(180deg, rgb(0 0 0 / 0.25) 0%, rgb(0 0 0 / 0.05) 40%, rgb(0 0 0 / 0.75) 100%)",
  ].join(", "),
};

function StatCard({ stat }: { stat: Partial<Stat> }) {
  const background = stat.background ?? (stat.image ? "image" : "raised");
  const showPhoto = background === "image" && stat.image?.url;
  const href = stat.link?.url || undefined;
  const surface =
    background === "glow" ? "bg-page border border-line-subtle" : background === "raised" || !showPhoto ? "bg-raised" : "bg-page";

  return (
    <article
      className={`group relative flex h-[27.5rem] flex-col justify-between overflow-clip rounded-md px-8 pt-6 pb-8 max-lg:h-auto max-lg:min-h-[17.5rem] max-lg:gap-10 max-lg:px-5 max-lg:pt-5 max-lg:pb-5 md:max-lg:min-h-[20rem] ${surface}`}
      style={background === "glow" ? cardGlow : undefined}
    >
      {showPhoto && (
        <>
          <Img
            media={stat.image}
            className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-soft motion-safe:group-hover:scale-[1.03]"
          />
          <div aria-hidden className="absolute inset-0" style={photoOverlay} />
        </>
      )}

      {/* Whole card clicks through; the arrow is the accessible link. */}
      {href && <a href={href} aria-hidden tabIndex={-1} className="absolute inset-0 z-10" />}

      <div className="pointer-events-none relative z-20">
        {stat.number && <CountUp value={stat.number} className="type-number-m block whitespace-nowrap text-ink" />}
      </div>

      <div className="pointer-events-none relative z-20 flex items-end justify-between gap-6">
        <div className="flex max-w-[20rem] min-w-0 flex-1 flex-col">
          {stat.title && <h3 className="type-h6 text-ink">{stat.title}</h3>}
          {stat.description && <p className="type-body-xs pt-2 text-subtle">{stat.description}</p>}
        </div>
        {href && <ArrowLink href={href} label={stat.title || stat.number || "Learn more"} className="pointer-events-auto" />}
      </div>
    </article>
  );
}

export default function Stats({ data }: BlockProps<Data>) {
  const stats = (data.stats ?? []).filter(Boolean);
  return (
    <section className="bg-page" style={sectionGlow}>
      <div className="site-container flex items-start justify-between gap-16 px-margin py-section max-lg:flex-col max-lg:gap-10">
        <div className="w-[27.5rem] shrink-0 max-lg:w-full">
          <SectionHeader
            eyebrow={data.eyebrow}
            title={data.heading}
            description={data.description}
            layout="stacked"
            size="h2"
            tone="dark"
            action={data.button?.label ? <Button link={data.button} variant="secondary" size="s" /> : undefined}
          />
        </div>
        {stats.length > 0 && (
          <div className="grid shrink-0 grid-cols-[repeat(2,31.25rem)] gap-4 max-lg:w-full max-lg:grid-cols-1 max-lg:gap-3 md:max-lg:grid-cols-2">
            {stats.map((stat, i) => (
              <StatCard key={i} stat={stat} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
