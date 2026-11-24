import type { BlockProps, Link } from "@/lib/types";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import ModelCard from "@/components/ui/ModelCard";

// Model Grid: Section Head and a grid of Card / Model, filled from the
// Products records (WordPress → Products) whose series is in the list, in
// their Order. Light or dark section. 3 columns, 2 on tablets, 1 on phones.

type Data = {
  anchor: string;
  tone: "light" | "dark";
  eyebrow: string;
  heading: string;
  description: string;
  button: Link;
  series: string;
};

export default function ModelGrid({ data, extras }: BlockProps<Data>) {
  const wanted = (data.series ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const models = (extras?.products ?? []).filter((p) => p.category && wanted.includes((p.series ?? "").toLowerCase()));
  const light = data.tone === "light";
  return (
    <section id={data.anchor || undefined} className={`scroll-mt-4 ${light ? "bg-white text-black" : "bg-page"}`}>
      <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
        {(data.heading || data.eyebrow) && (
          <SectionHeader
            eyebrow={data.eyebrow}
            title={data.heading}
            description={data.description}
            size="h2"
            tone={light ? "light" : "dark"}
            action={<Button link={data.button} variant={light ? "secondary-light" : "secondary"} />}
          />
        )}
        {models.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-3">
            {models.map((p) => (
              <ModelCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className={`type-body-s ${light ? "text-secondary" : "text-muted"}`}>No products in {data.series || "this list"} yet.</p>
        )}
      </div>
    </section>
  );
}
