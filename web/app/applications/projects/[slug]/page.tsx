/* Case study TEMPLATE: one page per Projects record (WordPress → Projects):
   photo hero with application, name and summary; facts row (location, year,
   partner, products); key numbers; challenge / solution / result; quote;
   more photos; more projects in the same application; Let's connect. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Img from "@/components/ui/Img";
import { Eyebrow } from "@/components/ui/SectionHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Blocks from "@/components/blocks/Blocks";
import ProjectCard from "@/components/projects/ProjectCard";
import { getPage, getProjects, getSettings } from "@/lib/wp";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects().catch(() => []);
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: "stadium-world-tour-2026" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProjects().catch(() => [])).find((x) => x.slug === slug);
  return { title: p ? `${p.name} · Projects · Adamson` : "Project · Adamson", description: p?.summary };
}

/** Application → its page, for the breadcrumb. */
const appPath: Record<string, string> = {
  Touring: "/applications/touring",
  "Performing Arts": "/applications/installed-sound/performing-arts",
  "Stadiums & Arenas": "/applications/installed-sound/stadiums-arenas",
  "Houses of Worship": "/applications/installed-sound/houses-of-worship",
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [projects, settings, projectsPage] = await Promise.all([
    getProjects().catch(() => []),
    getSettings().catch(() => ({})),
    getPage({ path: "applications/projects" }).catch(() => null),
  ]);
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();

  const related = [
    ...projects.filter((x) => x.slug !== p.slug && x.application === p.application),
    ...projects.filter((x) => x.slug !== p.slug && x.application !== p.application),
  ].slice(0, 3);
  const connect = (projectsPage?.blocks ?? []).filter((b) => b.name === "adamson/connect");
  const products = (p.products ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const facts = [
    { label: "Application", value: p.application },
    { label: "Location", value: p.location },
    { label: "Year", value: p.year },
    { label: "Partner", value: p.partner },
  ].filter((f) => f.value);
  const stats = (p.stats ?? []).filter((s) => s?.value);
  const story = [
    { label: "The challenge", text: p.challenge },
    { label: "The solution", text: p.solution },
    { label: "The result", text: p.result },
  ].filter((s) => s.text);
  const gallery = (p.gallery ?? []).filter((g) => g?.image?.url);

  return (
    <>
      <Header settings={settings} />
      <main>
        {/* Hero */}
        <section className="bg-page">
          <div className="site-container px-5 max-lg:px-3">
            <div className="relative h-[47.5rem] overflow-clip rounded-lg bg-raised max-lg:h-[36rem] max-md:h-[32rem]">
              <Img media={p.image} eager className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/30 via-55% to-transparent max-md:from-black/70 max-md:via-black/50" />
              <div className="absolute inset-x-0 bottom-0 h-[23.75rem] bg-linear-to-b from-transparent to-black/90" />
              <div className="absolute bottom-16 left-12 flex w-[44rem] flex-col gap-6 max-lg:inset-x-5 max-lg:bottom-8 max-lg:w-auto">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 type-body-xs text-subtle">
                  <Link href="/applications" className="hover:text-ink">Applications</Link>
                  <span aria-hidden>/</span>
                  <Link href="/applications/projects" className="hover:text-ink">Projects</Link>
                </nav>
                <Eyebrow>{[p.application, p.region].filter(Boolean).join(" · ")}</Eyebrow>
                <h1 className="type-h2 text-ink">{p.name}</h1>
                {p.summary && <p className="type-body-l max-w-[36rem] text-subtle">{p.summary}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Facts + products */}
        <section className="bg-page">
          <div className="site-container flex items-start justify-between gap-12 px-margin pt-10 pb-4 max-lg:flex-col max-lg:gap-6">
            <dl className="grid grid-cols-4 gap-x-12 gap-y-4 max-lg:grid-cols-2 max-md:gap-x-6">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col gap-1">
                  <dt className="type-eyebrow text-muted">{f.label}</dt>
                  <dd className="type-body-m text-ink">
                    {f.label === "Application" && f.value && appPath[f.value] ? (
                      <a href={appPath[f.value]} className="underline decoration-line underline-offset-4 hover:text-accent">{f.value}</a>
                    ) : (
                      f.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {products.length > 0 && (
              <div className="flex flex-col gap-2 lg:items-end">
                <p className="type-eyebrow text-muted">Adamson products</p>
                <ul className="flex flex-wrap gap-2 lg:justify-end">
                  {products.map((t) => (
                    <li key={t} className="rounded-full border border-line px-3 py-[0.4375rem] type-tag text-ink">{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Key numbers */}
        {stats.length > 0 && (
          <section className="bg-page">
            <div className="site-container px-margin pt-16 max-lg:pt-10">
              <ul className={`grid gap-4 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-3 ${["lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4"][stats.length - 1] ?? "lg:grid-cols-4"}`}>
                {stats.map((s, i) => (
                  <li key={i} className="flex flex-col gap-3 rounded-md border border-line-subtle bg-white/[0.03] p-8 max-lg:p-5">
                    <span className="type-number-m whitespace-nowrap text-ink max-lg:!text-[3rem] max-lg:!leading-[1]">{s.value}</span>
                    <span className="type-body-s text-subtle">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Story */}
        {story.length > 0 && (
          <section className="bg-page">
            <div className="site-container grid grid-cols-3 gap-12 px-margin py-section max-lg:grid-cols-1 max-lg:gap-8">
              {story.map((s, i) => (
                <div key={s.label} className="flex flex-col gap-4 border-t border-line-subtle pt-6">
                  <span className="type-counter text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="type-h4 text-ink">{s.label}</h2>
                  <p className="type-body-m whitespace-pre-line text-subtle">{s.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quote */}
        {p.quote?.text && (
          <section className="bg-page">
            <div className="site-container px-margin pb-section">
              <figure className="flex flex-col items-center gap-8 rounded-lg border border-line-subtle bg-white/[0.03] px-12 py-20 text-center max-lg:px-6 max-lg:py-12">
                <blockquote className="type-h3 max-w-[60rem] text-ink">“{p.quote.text}”</blockquote>
                {(p.quote.name || p.quote.role) && (
                  <figcaption className="flex flex-col gap-1">
                    {p.quote.name && <span className="type-body-m font-medium text-ink">{p.quote.name}</span>}
                    {p.quote.role && <span className="type-body-s text-muted">{p.quote.role}</span>}
                  </figcaption>
                )}
              </figure>
            </div>
          </section>
        )}

        {/* More photos */}
        {gallery.length > 0 && (
          <section className="bg-page">
            <div className={`site-container grid gap-4 px-margin pb-section max-md:grid-cols-1 ${gallery.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {gallery.map((g, i) => (
                <div key={i} className="relative aspect-[16/10] overflow-clip rounded-md bg-raised">
                  <Img media={g.image} className="absolute inset-0 size-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* More projects */}
        {related.length > 0 && (
          <section className="bg-white text-black">
            <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
              <SectionHeader
                eyebrow="Projects"
                title="More projects"
                size="h2"
                tone="light"
                action={<Button href="/applications/projects" label="All projects" variant="secondary-light" />}
              />
              <div className="grid grid-cols-3 gap-x-4 gap-y-10 max-lg:grid-cols-2 max-md:grid-cols-1">
                {related.map((r) => (
                  <ProjectCard key={r.id} project={r} light />
                ))}
              </div>
            </div>
          </section>
        )}

        <Blocks blocks={connect} extras={{}} />
      </main>
      <Footer settings={settings} />
    </>
  );
}

export const instant = false;
