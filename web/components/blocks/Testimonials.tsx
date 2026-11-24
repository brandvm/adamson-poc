/* eslint-disable @next/next/no-img-element */
import type { BlockProps, Link, Media } from "@/lib/types";
import Button from "@/components/ui/Button";
import Img from "@/components/ui/Img";
import SectionHeader from "@/components/ui/SectionHeader";
import CountUp from "@/components/motion/CountUp";

// 09 Trusted by top engineers (Figma 463:1002): header, a large photo quote and
// a 2×2 grid (stat card with avatars + three "Card / Quote" cards).

type Quote = { quote: string; name: string; role: string; button: Link };
type Data = {
  eyebrow: string;
  title: string;
  button: Link;
  featured: Partial<Quote & { image: Media }>;
  stat: Partial<{ value: string; label: string; avatars: { image?: Media }[] }>;
  quotes: Partial<Quote>[];
};

const card = "rounded-lg border border-line-subtle bg-page";

function QuoteMark() {
  return (
    <div className="h-7 shrink-0">
      <img src="/design/testimonials/quote-mark.svg" alt="" width={26} height={31} className="h-[1.9375rem] w-[1.625rem]" />
    </div>
  );
}

function Attribution({ name, role, button }: Partial<Quote>) {
  if (!name && !role && !button?.label) return null;
  return (
    <figcaption className="flex items-end gap-7 max-lg:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {name && <p className="type-body-s-strong text-ink">{name}</p>}
        {role && <p className="type-body-s text-muted">{role}</p>}
      </div>
      <Button link={button} variant="secondary" />
    </figcaption>
  );
}

export default function Testimonials({ data }: BlockProps<Data>) {
  const featured = data.featured ?? {};
  const stat = data.stat ?? {};
  const avatars = (stat.avatars ?? []).filter((a) => a?.image?.url);
  const quotes = (data.quotes ?? []).filter((q) => q?.quote);
  const hasStat = Boolean(stat.value || stat.label || avatars.length);

  return (
    <section className="bg-page">
      <div className="site-container flex flex-col gap-[3.75rem] px-margin py-section">
        <SectionHeader
          layout="row"
          size="h2"
          eyebrow={data.eyebrow}
          title={data.title}
          action={data.button?.label ? <Button link={data.button} variant="secondary" /> : undefined}
        />

        <div className="flex items-stretch gap-4 max-lg:flex-col">
          {/* Featured quote with photo */}
          {(featured.quote || featured.image) && (
            <figure className="group relative min-h-[45.1875rem] w-[40.5rem] shrink-0 overflow-hidden rounded-lg border border-line-subtle max-lg:flex max-lg:min-h-[32rem] max-lg:w-full max-lg:flex-col max-lg:justify-end md:max-lg:min-h-[38rem]">
              <Img
                media={featured.image}
                className="absolute top-0 left-0 h-[38.625rem] w-[43.4375rem] object-cover max-lg:h-[85%] max-lg:w-full transition-transform duration-1000 ease-out-soft group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <div aria-hidden className="absolute inset-0 bg-linear-to-b from-black/20 to-black/92 to-70%" />
              <div className="absolute inset-x-8 bottom-[2.8125rem] flex flex-col gap-7 max-lg:relative max-lg:inset-auto max-lg:gap-5 max-lg:p-6 max-lg:pt-40">
                <QuoteMark />
                {featured.quote && <blockquote className="type-h4 w-[25.0625rem] text-ink max-lg:w-auto max-lg:max-w-[32rem]">{featured.quote}</blockquote>}
                <Attribution name={featured.name} role={featured.role} button={featured.button} />
              </div>
            </figure>
          )}

          {/* 2×2: stat card + quote cards */}
          {(hasStat || quotes.length > 0) && (
            <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-4 max-md:auto-rows-auto max-md:grid-cols-1">
              {hasStat && (
                <div className={`${card} flex min-h-[18.875rem] flex-col justify-between p-8 max-lg:gap-8 max-lg:p-6 max-md:min-h-0`}>
                  {avatars.length > 0 ? (
                    <div className="flex items-center">
                      {avatars.map((a, i) => (
                        <Img
                          key={i}
                          media={a.image}
                          className="relative -mr-[1.0625rem] size-[2.875rem] rounded-full object-cover ring-[0.1875rem] ring-page last:mr-0"
                        />
                      ))}
                    </div>
                  ) : (
                    <span />
                  )}
                  <div className="flex flex-col gap-4">
                    {stat.value && <CountUp value={stat.value} className="type-h4 text-ink" />}
                    {stat.label && <p className="text-[0.9375rem] leading-normal font-light text-muted">{stat.label}</p>}
                  </div>
                </div>
              )}

              {quotes.map((q, i) => (
                <figure key={i} className={`${card} flex min-h-[18.875rem] flex-col justify-between gap-8 p-8 max-lg:gap-6 max-lg:p-6 max-md:min-h-0`}>
                  <QuoteMark />
                  <blockquote className="type-quote w-[20.6875rem] max-w-full text-ink">{q.quote}</blockquote>
                  <Attribution name={q.name} role={q.role} button={q.button} />
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
