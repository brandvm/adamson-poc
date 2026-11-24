import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import SectionHeader, { Eyebrow } from "@/components/ui/SectionHeader";

// Feature Rows: Section Head, then rows that alternate image and text (number,
// Label Text, D3, Body, optional button). Used for the Technology pillars and
// for series and category overviews. Below 1024px every row stacks, image first.

type Row = { eyebrow: string; title: string; text: string; image: Media; link: Link };
type Data = { anchor: string; tone: "light" | "dark"; eyebrow: string; heading: string; description: string; rows: Row[] };

export default function FeatureRows({ data }: BlockProps<Data>) {
  const rows = (data.rows ?? []).filter(Boolean);
  const light = data.tone === "light";
  return (
    <section id={data.anchor || undefined} className={`scroll-mt-4 ${light ? "bg-white text-black" : "bg-page"}`}>
      <div className="site-container flex flex-col gap-16 px-margin py-section max-lg:gap-12">
        {(data.heading || data.eyebrow) && (
          <SectionHeader eyebrow={data.eyebrow} title={data.heading} description={data.description} size="h2" tone={light ? "light" : "dark"} />
        )}
        {rows.map((r, i) => (
          <div key={i} id={r.title ? r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined} className="grid scroll-mt-4 grid-cols-2 items-center gap-16 max-lg:grid-cols-1 max-lg:gap-6">
            <div className={`relative aspect-[4/3] overflow-clip rounded-lg ${light ? "bg-charcoal-400/20" : "bg-raised"} ${i % 2 ? "lg:order-2" : ""}`}>
              <Img media={r.image} className="absolute inset-0 size-full object-cover" />
            </div>
            <div className="flex max-w-[36rem] flex-col gap-4">
              <p className={`type-body-xs ${light ? "text-gold" : "text-accent"}`}>{String(i + 1).padStart(2, "0")}</p>
              {r.eyebrow && <Eyebrow tone={light ? "light" : "dark"}>{r.eyebrow}</Eyebrow>}
              {r.title && <h3 className={`type-h3 ${light ? "text-black" : "text-ink"}`}>{r.title}</h3>}
              {r.text && <p className={`type-body-l whitespace-pre-line ${light ? "text-secondary" : "text-subtle"}`}>{r.text}</p>}
              {r.link?.label && (
                <div className="pt-2">
                  <Button link={r.link} variant={light ? "secondary-light" : "secondary"} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
