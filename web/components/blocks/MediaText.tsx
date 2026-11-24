import type { BlockProps, Link, Media } from "@/lib/types";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeader";

// Media and text (no Figma frame; design-system build for the sitemap pages):
// a large rounded photo on one side, eyebrow + H2 + text + a short list + button
// on the other. Below lg the photo stacks above the text.

type Point = { title: string; text: string };
type Data = {
  anchor: string;
  theme: "dark" | "light";
  imagePosition: "left" | "right";
  eyebrow: string;
  heading: string;
  text: string;
  points: Point[];
  button: Link;
  image: Media;
};

export default function MediaText({ data }: BlockProps<Data>) {
  const light = data.theme === "light";
  const right = data.imagePosition === "right";
  const points = (data.points ?? []).filter((p) => p?.title || p?.text);
  return (
    <section id={data.anchor || undefined} className={`scroll-mt-4 ${light ? "bg-white text-black" : "bg-page"}`}>
      <div className={`site-container flex items-center gap-20 px-margin py-section max-lg:flex-col max-lg:items-stretch max-lg:gap-8 ${right ? "lg:flex-row-reverse" : ""}`}>
        <div className="relative h-[42.5rem] w-[47.5rem] shrink-0 overflow-clip rounded-lg bg-raised max-lg:aspect-[4/3] max-lg:h-auto max-lg:w-full max-lg:rounded-md">
          <Img media={data.image} className="absolute inset-0 size-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Eyebrow tone={light ? "light" : "dark"}>{data.eyebrow}</Eyebrow>
          {data.heading && <h2 className={`type-h2 ${light ? "text-black" : "text-ink"}`}>{data.heading}</h2>}
          {data.text && <p className={`type-body-l max-w-[36rem] whitespace-pre-line ${light ? "text-secondary" : "text-subtle"}`}>{data.text}</p>}
          {points.length > 0 && (
            <ul className={`flex flex-col border-t ${light ? "border-black/10" : "border-line-subtle"}`}>
              {points.map((p, i) => (
                <li key={i} className={`flex gap-6 border-b py-4 max-md:flex-col max-md:gap-1 ${light ? "border-black/10" : "border-line-subtle"}`}>
                  <span className={`type-body-m w-[13rem] shrink-0 font-medium ${light ? "text-black" : "text-ink"}`}>{p.title}</span>
                  <span className={`type-body-s ${light ? "text-secondary" : "text-subtle"}`}>{p.text}</span>
                </li>
              ))}
            </ul>
          )}
          {data.button?.label && (
            <div className="pt-2">
              <Button link={data.button} variant={light ? "contrast-light" : "contrast"} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
