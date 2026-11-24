import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import SectionHeader, { Eyebrow } from "@/components/ui/SectionHeader";

// Card Grid (no Figma design; built from the design system): Section Head over
// 2, 3 or 4 columns of cards. A card has an optional photo, eyebrow, D5 title,
// text, chips and a link (the whole card is clickable when it has one). Used
// for hubs (Support, Company), courses, team, shows, values. Theme dark/light.

type Card = { image: Media; eyebrow: string; title: string; text: string; tags: string; link: Link };
type Data = {
  anchor: string;
  theme: "dark" | "light";
  columns: "2" | "3" | "4";
  eyebrow: string;
  heading: string;
  description: string;
  button: Link;
  imageRatio: "landscape" | "square" | "portrait";
  cards: Card[];
};

const COLS = { "2": "md:grid-cols-2", "3": "md:grid-cols-2 lg:grid-cols-3", "4": "md:grid-cols-2 lg:grid-cols-4" } as const;
const RATIO = { landscape: "aspect-[16/10]", square: "aspect-square", portrait: "aspect-[4/5]" } as const;

export default function CardGrid({ data }: BlockProps<Data>) {
  const light = data.theme === "light";
  const tone = light ? "light" : "dark";
  const cards = (data.cards ?? []).filter((c) => c?.title);
  const ratio = RATIO[data.imageRatio ?? "landscape"] ?? RATIO.landscape;

  return (
    <section id={data.anchor || undefined} className={`scroll-mt-24 ${light ? "bg-white text-black" : "bg-page text-ink"}`}>
      <div className="site-container flex flex-col gap-16 px-margin py-section max-lg:gap-10">
        {(data.heading || data.eyebrow) && (
          <SectionHeader
            eyebrow={data.eyebrow}
            title={data.heading}
            description={data.description}
            size="h2"
            tone={tone}
            action={data.button?.label ? <Button link={data.button} variant={light ? "secondary-light" : "secondary"} /> : undefined}
          />
        )}
        <div className={`grid grid-cols-1 gap-4 ${COLS[data.columns ?? "3"] ?? COLS["3"]}`}>
          {cards.map((c, i) => {
            const tags = (c.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
            const href = c.link?.url;
            return (
              <article
                key={i}
                className={`group relative flex min-w-0 flex-col overflow-hidden rounded-lg border transition-colors ${
                  light ? "border-black/8 bg-[#f6f6f6] hover:border-black/20" : "border-line-subtle bg-raised/60 hover:border-line"
                }`}
              >
                {c.image?.url && (
                  <div className={`relative w-full overflow-hidden ${ratio} ${light ? "bg-black/5" : "bg-raised"}`}>
                    <Img media={c.image} className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3 p-8 max-lg:p-6">
                  {c.eyebrow && <Eyebrow tone={tone}>{c.eyebrow}</Eyebrow>}
                  <h3 className="type-h5">
                    {href ? (
                      <a href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {c.title}
                      </a>
                    ) : (
                      c.title
                    )}
                  </h3>
                  {c.text && <p className={`type-body-s ${light ? "text-secondary" : "text-subtle"}`}>{c.text}</p>}
                  {(tags.length > 0 || href) && (
                    <div className="mt-auto flex items-end justify-between gap-4 pt-4">
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t) => (
                          <span key={t} className={`type-tag rounded-full border px-3 py-[0.4375rem] ${light ? "border-black/14 text-black" : "border-line text-ink"}`}>{t}</span>
                        ))}
                      </div>
                      {href && (
                        <span aria-hidden className={`flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors ${light ? "border-black/15 group-hover:border-black/40" : "border-line bg-action-secondary group-hover:border-action-secondary-border-hover"}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/icons/arrow-right-line.svg" alt="" width={18} height={18} className={`size-[1.125rem] ${light ? "invert" : ""}`} />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
