import type { CSSProperties } from "react";
import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";

// 06 Technology (Figma 463:894): light section, "Section header" (row, H1,
// light) above a row of "Card / Feature" cards: dark product photo, eyebrow,
// H5 title, optional description + button. Wide cards take ~2× the width.
// Below lg: phones get a horizontal swipe row; tablets a 2-column grid where
// wide cards span both columns.

type Feature = {
  eyebrow: string;
  title: string;
  text: string;
  link: Link;
  background: Media;
  image: Media;
  size: "wide" | "narrow";
};
type Data = { eyebrow: string; heading: string; features: Feature[] };

// Figma card fills: gold glow top-left, grey glow top-right, 70% black over the photo.
const tone: CSSProperties = {
  backgroundImage: [
    "radial-gradient(80% 100% at 3.4% 9.6%, rgb(139 111 76 / 0.32), transparent 57%)",
    "radial-gradient(90% 110% at 93% 3%, rgb(91 90 95 / 0.6), transparent 70%)",
    "linear-gradient(rgb(0 0 0 / 0.7), rgb(0 0 0 / 0.7))",
  ].join(", "),
};

function FeatureCard({ feature }: { feature: Partial<Feature> }) {
  const wide = feature.size === "wide";
  const link = feature.link;
  const hasButton = Boolean(link?.label);
  const cardHref = !hasButton ? link?.url : undefined;
  const zoom = "transition-transform duration-700 ease-out-soft motion-safe:group-hover:scale-[1.03]";

  return (
    <article
      className={`group relative h-[37.5rem] min-w-0 overflow-clip rounded-md bg-page max-lg:h-[28rem] max-md:w-[80vw] max-md:flex-none max-md:snap-start ${wide ? "flex-[760_1_0%] md:max-lg:col-span-2" : "flex-[376_1_0%]"}`}
    >
      {/* Photo stack. Narrow cards dim the whole stack to 40%. */}
      <div aria-hidden className={`absolute inset-0 ${wide ? "" : "opacity-40"}`}>
        <Img media={feature.background} className={`absolute inset-0 size-full object-cover object-bottom ${wide ? "opacity-90" : ""}`} />
        <div className="absolute inset-0" style={tone} />
        <Img
          media={feature.image}
          className={`absolute inset-0 size-full object-cover ${wide ? "object-[86%_50%]" : "object-center"} ${zoom}`}
        />
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[16.25rem] bg-linear-to-b from-transparent to-black/80 max-lg:h-[75%] max-lg:via-black/60 max-lg:to-black/90" />

      {cardHref && <a href={cardHref} aria-label={feature.title || feature.eyebrow || "Learn more"} className="absolute inset-0 z-10" />}

      <div className={`absolute bottom-8 left-8 flex max-w-[calc(100%-4rem)] flex-col gap-4 max-lg:inset-x-5 max-lg:bottom-5 max-lg:w-auto max-lg:max-w-none ${wide ? "w-[33.4375rem] md:max-lg:max-w-[30rem]" : "w-[16.25rem]"}`}>
        <div className="flex flex-col gap-2">
          {feature.eyebrow && <p className="type-eyebrow text-accent">{feature.eyebrow}</p>}
          {feature.title && <h3 className="type-h5 text-ink">{feature.title}</h3>}
          {feature.text && <p className="type-body-s text-muted">{feature.text}</p>}
        </div>
        {hasButton && <Button link={link} variant="secondary" size="s" className="relative z-20 self-start" />}
      </div>
    </article>
  );
}

export default function Technology({ data }: BlockProps<Data>) {
  const features = (data.features ?? []).filter(Boolean);
  return (
    <section className="bg-white text-black">
      <div className="site-container flex flex-col gap-16 px-margin py-section max-lg:gap-10">
        {(data.eyebrow || data.heading) && <SectionHeader eyebrow={data.eyebrow} title={data.heading} layout="row" size="h1" tone="light" />}
        {features.length > 0 && (
          <div className="no-scrollbar flex gap-4 max-md:-mx-margin max-md:snap-x max-md:snap-mandatory max-md:scroll-px-margin max-md:overflow-x-auto max-md:px-margin max-md:gap-3 md:max-lg:grid md:max-lg:grid-cols-2">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
