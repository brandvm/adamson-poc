import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";

// Series Grid (Figma 507:1303 Loudspeakers): light section, Section Head (row,
// D1) and a 3-column grid of "Card / Series": photo, top and bottom shades, a
// Chip top-left, the series name (D4) and model count. Tablets 2 columns,
// phones 1.

type Series = { tag: string; name: string; meta: string; image: Media; link: Link; dim: boolean };
type Data = { anchor: string; eyebrow: string; heading: string; description: string; button: Link; series: Series[] };

function SeriesCard({ s }: { s: Partial<Series> }) {
  const href = s.link?.url;
  return (
    <article className="group relative h-[28.75rem] overflow-clip rounded-lg bg-raised max-lg:h-[24rem] max-md:h-[20rem]">
      <Img media={s.image} className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-soft motion-safe:group-hover:scale-[1.03]" />
      {s.dim && <div className="absolute inset-0 bg-black/50" />}
      <div className="absolute inset-x-0 bottom-0 h-[12.5rem] bg-linear-to-b from-transparent to-black/70" />
      <div className="absolute inset-x-0 top-0 h-[8.75rem] bg-linear-to-b from-black/55 to-transparent" />
      {href && <a href={href} aria-label={s.name || "View series"} className="absolute inset-0 z-10" />}
      {s.tag && <span className="absolute top-6 left-6 rounded-full border border-line px-3 py-[0.4375rem] type-tag text-ink">{s.tag}</span>}
      <div className="absolute inset-x-7 bottom-[1.6875rem] flex items-end justify-between gap-4 max-md:inset-x-5 max-md:bottom-5">
        {s.name && <h3 className="type-h4 text-ink">{s.name}</h3>}
        {s.meta && <p className="shrink-0 type-body-s text-subtle">{s.meta}</p>}
      </div>
    </article>
  );
}

export default function SeriesGrid({ data }: BlockProps<Data>) {
  const series = (data.series ?? []).filter(Boolean);
  return (
    <section id={data.anchor || undefined} className="scroll-mt-4 bg-white text-black">
      <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
        <SectionHeader
          eyebrow={data.eyebrow}
          title={data.heading}
          description={data.description}
          action={<Button link={data.button} variant="secondary-light" />}
          tone="light"
        />
        {series.length > 0 && (
          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-3">
            {series.map((s, i) => (
              <SeriesCard key={i} s={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
