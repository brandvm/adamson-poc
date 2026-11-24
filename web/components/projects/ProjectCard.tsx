import type { Project } from "@/lib/types";
import Img from "@/components/ui/Img";
import ArrowLink from "@/components/ui/ArrowLink";

/** Case study card: photo, application + location, name, summary. Whole card links to the case study. */
export default function ProjectCard({ project, light = false }: { project: Project; light?: boolean }) {
  const meta = [project.application, project.location].filter(Boolean).join(" · ");
  return (
    <article className="group relative flex flex-col gap-5">
      <a href={project.url} aria-hidden tabIndex={-1} className="absolute inset-0 z-10" />
      <div className="relative aspect-[4/3] overflow-clip rounded-md bg-raised">
        <Img media={project.image} className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-soft motion-safe:group-hover:scale-[1.03]" />
        <ArrowLink href={project.url} label={project.name} size={44} className="pointer-events-auto absolute right-4 bottom-4 z-20" />
      </div>
      <div className="flex flex-col gap-2 pr-4">
        {meta && <p className={`type-eyebrow ${light ? "text-gold" : "text-accent"}`}>{meta}</p>}
        <h3 className={`type-h5 ${light ? "text-black" : "text-ink"}`}>{project.name}</h3>
        {project.summary && <p className={`type-body-s line-clamp-3 ${light ? "text-secondary" : "text-subtle"}`}>{project.summary}</p>}
      </div>
    </article>
  );
}
