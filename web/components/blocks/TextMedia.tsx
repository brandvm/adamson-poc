import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeader";

// Text + Media (no Figma design; built from the design system): eyebrow, D2
// title, paragraphs and a button beside a rounded photo, plus an optional row
// of key points (number/label pairs or short facts). Theme dark or light; the
// photo sits left or right. Below lg it stacks, photo first.

type Point = { value: string; label: string };
type Data = {
  anchor: string;
  theme: "dark" | "light";
  imageSide: "left" | "right";
  eyebrow: string;
  heading: string;
  text: string;
  button: Link;
  image: Media;
  points: Point[];
};

export default function TextMedia({ data }: BlockProps<Data>) {
  const light = data.theme === "light";
  const paragraphs = (data.text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const points = (data.points ?? []).filter((p) => p?.value || p?.label);
  const right = data.imageSide !== "left";

  return (
    <section id={data.anchor || undefined} className={`scroll-mt-24 ${light ? "bg-white text-black" : "bg-page text-ink"}`}>
      <div className="site-container px-margin py-section">
        <div className={`grid items-center gap-16 lg:grid-cols-2 max-lg:gap-10 ${data.image?.url ? "" : "lg:grid-cols-1"}`}>
          <div className={`flex min-w-0 flex-col gap-6 ${right ? "lg:order-1" : "lg:order-2"} max-lg:order-2`}>
            {data.eyebrow && <Eyebrow tone={light ? "light" : "dark"}>{data.eyebrow}</Eyebrow>}
            {data.heading && <h2 className="type-h2">{data.heading}</h2>}
            {paragraphs.length > 0 && (
              <div className={`flex max-w-[36rem] flex-col gap-4 type-body-l ${light ? "text-secondary" : "text-subtle"}`}>
                {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
            {data.button?.label && (
              <div className="mt-2">
                <Button link={data.button} variant={light ? "contrast-light" : "contrast"} />
              </div>
            )}
            {points.length > 0 && (
              <dl className={`mt-4 grid grid-cols-2 gap-x-8 gap-y-6 border-t pt-8 sm:grid-cols-3 ${light ? "border-black/10" : "border-line-subtle"}`}>
                {points.map((p, i) => (
                  <div key={i} className="flex min-w-0 flex-col gap-1">
                    <dt className="type-h4">{p.value}</dt>
                    <dd className={`type-body-s ${light ? "text-secondary" : "text-muted"}`}>{p.label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {data.image?.url && (
            <div className={`relative aspect-[4/3] overflow-hidden rounded-lg ${light ? "bg-black/5" : "bg-raised"} ${right ? "lg:order-2" : "lg:order-1"} max-lg:order-1`}>
              <Img media={data.image} className="absolute inset-0 size-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
