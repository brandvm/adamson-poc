import type { BlockProps, Link } from "@/lib/types";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import ProjectFilter from "@/components/projects/ProjectFilter";

// Projects (no Figma frame; design-system build): case study cards from
// WordPress → Projects, featured first, optionally limited to some applications
// and a maximum count, with optional application / region / product filters.

type Data = {
  anchor: string;
  theme: "dark" | "light";
  eyebrow: string;
  heading: string;
  description: string;
  button: Link;
  applications: string;
  limit: number;
  filters: boolean;
};

export default function ProjectGrid({ data, extras }: BlockProps<Data>) {
  const light = data.theme === "light";
  const only = (data.applications ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  let projects = (extras?.projects ?? []).filter((p) => !only.length || only.includes((p.application ?? "").toLowerCase()));
  const limit = Number(data.limit) || 0;
  if (limit > 0) projects = projects.slice(0, limit);

  return (
    <section id={data.anchor || undefined} className={`scroll-mt-4 ${light ? "bg-white text-black" : "bg-page"}`}>
      <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
        {(data.heading || data.eyebrow) && (
          <SectionHeader
            eyebrow={data.eyebrow}
            title={data.heading}
            size="h2"
            description={data.description}
            tone={light ? "light" : "dark"}
            action={<Button link={data.button} variant={light ? "secondary-light" : "secondary"} />}
          />
        )}
        <ProjectFilter projects={projects} filters={Boolean(data.filters)} light={light} />
      </div>
    </section>
  );
}
