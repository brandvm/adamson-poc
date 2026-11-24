import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeader";

// Spotlight (Figma 510:2 Immersive · FletcherMachine): dark section, product
// photo filling the right ~63% (studio background + cut-out + gold glow) with
// left/top/bottom fades; on the left a stacked Section Head (D1), a button and
// a labelled row of chips. Below lg the photo sits above the text.

type Data = {
  anchor: string;
  eyebrow: string;
  heading: string;
  description: string;
  button: Link;
  listLabel: string;
  tags: string;
  background: Media;
  image: Media;
};

export default function Spotlight({ data }: BlockProps<Data>) {
  const tags = (data.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <section id={data.anchor || undefined} className="scroll-mt-4 bg-page">
      <div className="site-container relative h-[55rem] overflow-clip max-lg:flex max-lg:h-auto max-lg:flex-col">
        <div className="absolute inset-y-0 right-0 w-[66.25rem] max-lg:relative max-lg:inset-auto max-lg:aspect-[16/9] max-lg:w-full">
          <Img media={data.background} className="absolute inset-0 size-full object-fill" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(40% 50% at 95% 90%, rgb(139 111 76 / 0.32), transparent 57%)" }}
          />
          <Img media={data.image} className="absolute inset-0 size-full object-fill" />
          <div className="absolute inset-y-0 left-0 w-[11.6875rem] bg-linear-to-r from-black to-transparent max-lg:hidden" />
          <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black to-transparent max-lg:h-8" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-black max-lg:h-16" />
        </div>

        <div className="absolute inset-y-0 left-margin flex w-[43.0625rem] flex-col justify-center gap-12 max-lg:relative max-lg:inset-auto max-lg:w-auto max-lg:gap-8 max-lg:px-margin max-lg:pt-6 max-lg:pb-section">
          <div className="flex flex-col items-start gap-6">
            <div className="flex flex-col gap-4">
              <Eyebrow>{data.eyebrow}</Eyebrow>
              {data.heading && <h2 className="type-h1 break-words text-ink">{data.heading}</h2>}
              {data.description && <p className="max-w-[20.625rem] type-body-s text-subtle">{data.description}</p>}
            </div>
            <Button link={data.button} variant="secondary" />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-col gap-4">
              {data.listLabel && <p className="type-eyebrow text-muted">{data.listLabel}</p>}
              <ul className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <li key={t} className="rounded-full border border-line px-3 py-[0.4375rem] type-tag text-ink">{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
