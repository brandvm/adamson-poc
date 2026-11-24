/* eslint-disable @next/next/no-img-element */
import type { BlockProps, Link, Media } from "@/lib/types";
import Button from "@/components/ui/Button";
import Img from "@/components/ui/Img";

/**
 * 13 Let's connect (Figma 505:770). Closing CTA: gold-toned concert photo,
 * large ADAMSON wordmark behind an optional foreground cut-out, dark fades,
 * and a centered logo mark, title, text and white button.
 *
 * Below lg the content flows at the top and the artwork keeps the desktop
 * geometry scaled to the container width (cqw), anchored to the section
 * bottom: photo and cut-out share width and top edge, so the array lines up.
 * Desktop rem values / 105rem (container width) give the cqw numbers.
 */
type Data = { title: string; description: string; button: Link; background: Media; foreground: Media };

// Warm, darkened toning of the concert photo (and its cut-out).
const TONE = { filter: "grayscale(1) sepia(0.9) saturate(1.35) hue-rotate(-6deg) brightness(0.58) contrast(1.1)" };

export default function Connect({ data }: BlockProps<Data>) {
  return (
    <section className="relative isolate overflow-hidden bg-page">
      <div className="site-container relative h-[62.25rem] max-lg:@container max-lg:h-auto">
        {/* Photo, toned warm and darkened (Figma: gold hue blend over the photo). */}
        {data.background?.url && (
          <div aria-hidden className="absolute inset-x-0 top-[-3.0625rem] h-[70.105rem] max-lg:top-auto max-lg:bottom-[-4.564cqw] max-lg:aspect-[105/70.105] max-lg:h-auto">
            <Img media={data.background} alt="" eager className="absolute inset-0 size-full object-cover" style={TONE} />
          </div>
        )}

        {/* Bottom fade, under the wordmark */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[26rem] bg-linear-to-b from-transparent to-black max-lg:h-[24.76cqw]" />

        {/* ADAMSON wordmark: soft-light / tinted / soft-light, as in Figma */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[44.87rem] left-[-0.2865rem] h-[17.753rem] w-[105.287rem] max-lg:top-auto max-lg:bottom-[-0.355cqw] max-lg:left-[-0.273cqw] max-lg:aspect-[105.287/17.753] max-lg:h-auto max-lg:w-[100.273cqw]"
        >
          <img src="/design/connect/wordmark-soft.svg" alt="" width={1685} height={284} className="absolute inset-0 size-full mix-blend-soft-light" />
          <img src="/design/connect/wordmark.svg" alt="" width={1685} height={284} className="absolute inset-0 size-full" />
          <img src="/design/connect/wordmark-soft.svg" alt="" width={1685} height={284} className="absolute inset-0 size-full mix-blend-soft-light" />
        </div>

        {/* Foreground cut-out passes in front of the wordmark */}
        <Img
          media={data.foreground}
          alt=""
          eager
          className="pointer-events-none absolute inset-x-0 top-[-3.0625rem] h-[54.914rem] w-full object-cover max-lg:top-auto max-lg:bottom-[9.903cqw] max-lg:aspect-[105/54.914] max-lg:h-auto"
        />

        {/* Top fade: black behind the heading, opening up towards the stage.
            Below lg: solid down to the photo's top edge (62.2cqw above the bottom), then fades over 24cqw. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[34rem] bg-linear-to-b from-black from-15% via-black/70 to-transparent max-lg:bottom-[38.2cqw] max-lg:h-auto max-lg:bg-[linear-gradient(to_bottom,black_calc(100%-24cqw),transparent)]"
        />

        <div className="relative flex flex-col items-center gap-7 px-margin pt-20 text-center max-lg:gap-5 max-lg:pt-section max-lg:pb-[56cqw]">
          <div className="h-[3.7917rem] w-[4.0833rem]">
            <img src="/design/connect/logo-mark.svg" alt="" width={65} height={56} className="h-[3.5rem] w-[4.0833rem]" />
          </div>
          {data.title && <h2 className="type-h2 text-ink">{data.title}</h2>}
          {data.description && <p className="max-w-[45rem] type-body-m text-subtle">{data.description}</p>}
          <Button link={data.button} variant="contrast" size="m" />
        </div>
      </div>
    </section>
  );
}
