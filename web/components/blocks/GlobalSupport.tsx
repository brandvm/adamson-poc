/* eslint-disable @next/next/no-img-element */
import type { BlockProps } from "@/lib/types";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * 12 Global support (Figma 463:1222). Centered header over a dotted world map
 * with a ring and a bottom fade. The map artwork is decorative; each region
 * (pin + label) is content and positioned in % of the map so editors can move it.
 * Below lg: header on top, the map scaled to the screen width (pins stay in %),
 * and the region labels move to a list under the map (they collide when small).
 */
type Region = { label: string; text: string; link: string; x: number; y: number; side: "left" | "right" };
type Data = { eyebrow: string; title: string; description: string; regions: Region[] };

const num = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : fallback;
};

function MapRegion({ region }: { region: Partial<Region> }) {
  const left = region.side === "left";
  const hasLabel = region.label || region.text;
  const labelClass = `absolute top-[calc(50%+0.35rem)] flex max-lg:hidden -translate-y-1/2 items-center gap-2 overflow-hidden rounded-full border border-line-subtle bg-black/85 px-[0.875rem] py-2 whitespace-nowrap backdrop-blur-[5px] transition-colors duration-200 ${
    left ? "right-[calc(100%+0.875rem)]" : "left-[calc(100%+0.7rem)]"
  }`;
  const label = (
    <>
      {region.label && <span className="type-eyebrow text-ink">{region.label}</span>}
      {region.label && region.text && (
        <img src="/design/global-support/divider-dot.svg" alt="" width={3} height={3} className="size-[0.216815rem]" />
      )}
      {region.text && <span className="type-body-s text-subtle">{region.text}</span>}
    </>
  );

  return (
    <div
      className="absolute h-[3.5rem] w-[4.0625rem] -translate-x-1/2 -translate-y-1/2 max-lg:h-8 max-lg:w-[2.32rem] md:max-lg:h-11 md:max-lg:w-[3.19rem]"
      style={{ left: `${num(region.x, 50)}%`, top: `${num(region.y, 50)}%` }}
    >
      <img src="/design/global-support/pin.svg" alt="" width={65} height={56} className="h-[3.5rem] w-[4.083333rem] max-lg:size-full" />
      {hasLabel &&
        (region.link ? (
          <a href={region.link} className={`${labelClass} hover:border-line`}>
            {label}
          </a>
        ) : (
          <div className={labelClass}>{label}</div>
        ))}
    </div>
  );
}

function RegionList({ regions }: { regions: Partial<Region>[] }) {
  const items = regions.filter((r) => r.label || r.text);
  if (!items.length) return null;
  return (
    <ul className="mt-8 grid gap-3 md:grid-cols-3 lg:hidden">
      {items.map((region, i) => {
        const body = (
          <>
            <img src="/design/global-support/pin.svg" alt="" width={65} height={56} className="h-6 w-[1.75rem] shrink-0" />
            <span className="flex flex-col gap-1">
              {region.label && <span className="type-eyebrow text-ink">{region.label}</span>}
              {region.text && <span className="type-body-s text-subtle">{region.text}</span>}
            </span>
          </>
        );
        const cls = "flex min-h-14 items-center gap-3 rounded-sm border border-line-subtle bg-black/85 px-4 py-3";
        return (
          <li key={i}>
            {region.link ? (
              <a href={region.link} className={`${cls} h-full transition-colors duration-200 hover:border-line`}>
                {body}
              </a>
            ) : (
              <div className={`${cls} h-full`}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function GlobalSupport({ data }: BlockProps<Data>) {
  const regions = data.regions ?? [];
  return (
    <section className="relative overflow-hidden bg-page max-lg:flex max-lg:flex-col max-lg:pb-section">
      <div className="site-container relative h-[59.625rem] max-lg:h-auto max-lg:px-margin">
        {/* Decorative ring + dotted world map */}
        <img
          src="/design/global-support/ring.svg"
          alt=""
          width={980}
          height={980}
          aria-hidden
          className="pointer-events-none absolute top-[2.25rem] left-[14.375rem] size-[61.25rem] max-lg:hidden"
        />
        {/* Below lg the map is in flow at screen width; offsets are the desktop rem values as % of the map. */}
        <div className="absolute top-[19.54rem] left-[4.625rem] h-[42.857rem] w-[93.375rem] max-lg:relative max-lg:inset-auto max-lg:mt-10 max-lg:aspect-[93.375/42.857] max-lg:h-auto max-lg:w-full">
          <img
            src="/design/global-support/ring.svg"
            alt=""
            width={980}
            height={980}
            aria-hidden
            className="pointer-events-none absolute top-[-40.34%] left-[10.44%] aspect-square w-[65.6%] lg:hidden"
          />
          <img
            src="/design/global-support/map-dots.svg"
            alt=""
            width={1454}
            height={670}
            aria-hidden
            className="pointer-events-none absolute top-[0.224rem] left-[1.4628rem] h-[41.9053rem] w-[90.862rem] max-lg:top-[0.523%] max-lg:left-[1.567%] max-lg:h-[97.78%] max-lg:w-[97.31%]"
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-transparent to-black lg:hidden" />
          {regions.map((region, i) => (
            <MapRegion key={i} region={region} />
          ))}
        </div>
        <RegionList regions={regions} />
      </div>

      {/* Bottom fade into the next section */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[15rem] bg-linear-to-b from-transparent to-black max-lg:hidden" />

      <div className="absolute inset-x-0 top-section flex flex-col items-center gap-4 px-margin text-center max-lg:relative max-lg:inset-auto max-lg:z-10 max-lg:order-first max-lg:pt-section">
        <SectionHeader eyebrow={data.eyebrow} title={data.title} layout="center" size="h2" />
        {data.description && <p className="type-body-s whitespace-pre-wrap text-subtle">{data.description}</p>}
      </div>
    </section>
  );
}
