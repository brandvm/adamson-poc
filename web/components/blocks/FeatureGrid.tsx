import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import ArrowLink from "@/components/ui/ArrowLink";
import SectionHeader from "@/components/ui/SectionHeader";

// Feature grid (no Figma frame; built from the design system for the sitemap
// pages). Row section header, then cards: a card with a photo is a tall photo
// card like Applications / Why Adamson; without one it is a glass text card
// with an optional 01, 02 … number. Grid: 2–4 columns, 2 on tablets, 1 on phones.

type Item = { title: string; meta: string; text: string; link: Link; image: Media };
type Data = {
  anchor: string;
  theme: "dark" | "light";
  columns: "2" | "3" | "4";
  numbered: boolean;
  eyebrow: string;
  heading: string;
  description: string;
  button: Link;
  items: Item[];
};

const cols = { "2": "lg:grid-cols-2", "3": "lg:grid-cols-3", "4": "lg:grid-cols-4" } as const;

function Card({ item, index, numbered, light }: { item: Partial<Item>; index: number; numbered: boolean; light: boolean }) {
  const href = item.link?.url || undefined;
  const photo = Boolean(item.image?.url);

  if (photo) {
    return (
      <article className="group relative isolate flex h-[32.5rem] flex-col justify-end overflow-clip rounded-md bg-raised p-8 max-lg:h-auto max-lg:aspect-[4/5] max-lg:p-5">
        <Img media={item.image} className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 ease-out-soft motion-safe:group-hover:scale-[1.03]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_35%,rgb(0_0_0/0.8)_100%)]" />
        {href && <a href={href} aria-hidden tabIndex={-1} className="absolute inset-0 z-10" />}
        <div className="pointer-events-none relative z-20 flex items-end justify-between gap-6">
          <div className="flex min-w-0 flex-col gap-2">
            {item.meta && <p className="type-eyebrow text-accent">{item.meta}</p>}
            {item.title && <h3 className="type-h5 text-ink">{item.title}</h3>}
            {item.text && <p className="type-body-s max-w-[26rem] text-subtle">{item.text}</p>}
          </div>
          {href && <ArrowLink href={href} label={item.title || "Open"} className="pointer-events-auto" />}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative flex min-h-[15rem] flex-col justify-between gap-8 overflow-clip rounded-md border p-8 max-lg:min-h-0 max-lg:p-5 ${
        light ? "border-black/10 bg-[#f4f4f4]" : "border-line-subtle bg-white/[0.03]"
      }`}
    >
      {href && <a href={href} aria-hidden tabIndex={-1} className="absolute inset-0 z-10" />}
      <div className="flex items-start justify-between gap-4">
        {numbered ? (
          <span className={`type-counter ${light ? "text-gold" : "text-accent"}`}>{String(index + 1).padStart(2, "0")}</span>
        ) : (
          item.meta && <p className={`type-eyebrow ${light ? "text-gold" : "text-accent"}`}>{item.meta}</p>
        )}
        {href && <ArrowLink href={href} label={item.title || "Open"} size={44} className="pointer-events-auto relative z-20" />}
      </div>
      <div className="flex flex-col gap-2">
        {numbered && item.meta && <p className={`type-eyebrow ${light ? "text-gold" : "text-accent"}`}>{item.meta}</p>}
        {item.title && <h3 className={`type-h5 ${light ? "text-black" : "text-ink"}`}>{item.title}</h3>}
        {item.text && <p className={`type-body-s ${light ? "text-secondary" : "text-subtle"}`}>{item.text}</p>}
      </div>
    </article>
  );
}

export default function FeatureGrid({ data }: BlockProps<Data>) {
  const light = data.theme === "light";
  const items = (data.items ?? []).filter(Boolean);
  return (
    <section id={data.anchor || undefined} className={`scroll-mt-4 ${light ? "bg-white text-black" : "bg-page"}`}>
      <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
        {(data.heading || data.eyebrow) && (
          <SectionHeader
            eyebrow={data.eyebrow}
            title={data.heading}
            size="h2"
            description={data.description}
            tone={light ? "light" : "dark"}
            action={<Button link={data.button} variant={light ? "secondary-light" : "secondary"} />}
          />
        )}
        {items.length > 0 && (
          <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 max-md:gap-3 ${cols[data.columns ?? "3"] ?? cols["3"]}`}>
            {items.map((item, i) => (
              <Card key={i} item={item} index={i} numbered={Boolean(data.numbered)} light={light} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
