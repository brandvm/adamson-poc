import type { CSSProperties } from "react";
import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import ArrowLink from "@/components/ui/ArrowLink";
import SectionHeader, { Eyebrow } from "@/components/ui/SectionHeader";

// Category Bento (Figma 508:2 Electronics, 509:26 Software): Section Head
// (row, D1) over a bento of one "Card / Feature" (photo, eyebrow, D5 title,
// note, button) and a column of "Card / Category" cards (title, note, chips,
// arrow link) that share its height. Theme dark or light; the feature can sit
// left or right. Below lg everything stacks, feature first.

type Feature = { eyebrow: string; title: string; text: string; link: Link; background: Media; image: Media };
type Category = { title: string; text: string; tags: string; link: Link };
type Data = {
  anchor: string;
  theme: "dark" | "light";
  featurePosition: "left" | "right";
  eyebrow: string;
  heading: string;
  description: string;
  button: Link;
  feature: Partial<Feature>;
  categories: Category[];
};

// Figma "Card / Category" fill: a soft gold glow in the top-right corner on black.
const glow: CSSProperties = {
  backgroundImage: "radial-gradient(60% 120% at 95% 0%, rgb(139 111 76 / 0.22), transparent 60%), linear-gradient(#000, #000)",
};

function CategoryCard({ c }: { c: Partial<Category> }) {
  const tags = (c.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <article className="relative flex min-h-[11.25rem] flex-1 items-center gap-6 overflow-clip rounded-md border border-line-subtle px-8 py-7 max-md:px-5 max-md:py-6" style={glow}>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {c.title && <h3 className="type-h5 text-ink">{c.title}</h3>}
        {c.text && <p className="type-body-s text-subtle">{c.text}</p>}
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 pt-2">
            {tags.map((t) => (
              <li key={t} className="rounded-full border border-line px-3 py-[0.4375rem] type-tag text-ink">{t}</li>
            ))}
          </ul>
        )}
      </div>
      {c.link?.url && <ArrowLink href={c.link.url} label={c.title || "Open"} />}
    </article>
  );
}

function FeatureCard({ f }: { f: Partial<Feature> }) {
  return (
    <article className="relative h-[37.5rem] w-[47.5rem] shrink-0 overflow-clip rounded-md bg-page max-lg:h-[32rem] max-lg:w-full max-md:h-[26rem]">
      <Img media={f.background} className="absolute inset-0 size-full object-cover" />
      <Img media={f.image} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-[16.25rem] bg-linear-to-b from-transparent to-black/80 max-md:h-3/4" />
      <div className="absolute bottom-8 left-8 flex w-[33.4375rem] max-w-[calc(100%-4rem)] flex-col gap-4 max-md:inset-x-5 max-md:bottom-5 max-md:w-auto max-md:max-w-none">
        <div className="flex flex-col gap-2">
          <Eyebrow>{f.eyebrow}</Eyebrow>
          {f.title && <h3 className="type-h5 text-ink">{f.title}</h3>}
          {f.text && <p className="type-body-s text-muted">{f.text}</p>}
        </div>
        <Button link={f.link} variant="secondary" className="self-start" />
      </div>
    </article>
  );
}

export default function CategoryBento({ data }: BlockProps<Data>) {
  const light = data.theme === "light";
  const categories = (data.categories ?? []).filter(Boolean);
  const right = data.featurePosition === "right";
  return (
    <section id={data.anchor || undefined} className={`scroll-mt-4 ${light ? "bg-white text-black" : "bg-page"}`}>
      <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
        <SectionHeader
          eyebrow={data.eyebrow}
          title={data.heading}
          description={data.description}
          action={<Button link={data.button} variant={light ? "secondary-light" : "secondary"} />}
          tone={light ? "light" : "dark"}
        />
        <div className={`flex gap-4 max-lg:flex-col max-md:gap-3 ${right ? "flex-row-reverse" : ""}`}>
          <FeatureCard f={data.feature ?? {}} />
          {categories.length > 0 && (
            <div className="flex min-w-0 flex-1 flex-col gap-4 max-md:gap-3">
              {categories.map((c, i) => (
                <CategoryCard key={i} c={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
