/* Product page TEMPLATE: one page per Products record (WordPress → Products),
   built from its fields: hero (render or cut-out, name, tagline, key specs),
   overview and features, specs table, downloads, more from the series, and the
   Let's connect section from the products page. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Img from "@/components/ui/Img";
import Button from "@/components/ui/Button";
import ArrowLink from "@/components/ui/ArrowLink";
import ModelCard from "@/components/ui/ModelCard";
import StudioBackdrop, { ProductShadow } from "@/components/ui/StudioBackdrop";
import SectionHeader, { Eyebrow } from "@/components/ui/SectionHeader";
import Blocks from "@/components/blocks/Blocks";
import { getPage, getProducts, getSettings } from "@/lib/wp";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts().catch(() => []);
  const slugs = products.filter((p) => p.category).map((p) => ({ slug: p.slug }));
  return slugs.length ? slugs : [{ slug: "vgt" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProducts().catch(() => [])).find((x) => x.slug === slug);
  return { title: p ? `${p.name} · ${p.series || "Products"} · Adamson` : "Product · Adamson", description: p?.overview };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [products, settings, productsPage] = await Promise.all([
    getProducts().catch(() => []),
    getSettings().catch(() => ({})),
    getPage({ path: "products" }).catch(() => null),
  ]);
  const p = products.find((x) => x.slug === slug);
  if (!p || !p.category) notFound(); // records without a category (e.g. "M Series" in Products in action) have no page
  const related = products.filter((x) => x.category && x.series === p.series && x.slug !== p.slug).slice(0, 3);
  const connect = (productsPage?.blocks ?? []).filter((b) => b.name === "adamson/connect");
  const specs = (p.specs ?? []).filter((s) => s?.label && s?.value);
  const features = (p.features ?? []).filter((f) => f?.title);
  const downloads = (p.downloads ?? []).filter((d) => d?.label);
  const keySpecs = [
    p.range && { label: "Frequency range", value: p.range },
    p.spl && { label: p.splLabel || "Max peak SPL", value: p.spl },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <Header settings={settings} />
      <main>
        {/* Hero */}
        <section className="bg-page">
          <div className="site-container px-5 max-lg:px-3">
            <div className="relative grid min-h-[44rem] grid-cols-[minmax(0,5fr)_minmax(0,7fr)] overflow-clip rounded-lg bg-raised max-lg:min-h-0 max-lg:grid-cols-1">
              <div className="relative z-10 flex flex-col justify-between gap-10 p-12 max-lg:order-2 max-lg:p-6">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 type-body-xs text-muted">
                  <Link href="/products" className="hover:text-ink">Products</Link>
                  {p.series && (
                    <>
                      <span aria-hidden>/</span>
                      {p.seriesUrl ? <a href={p.seriesUrl} className="hover:text-ink">{p.series}</a> : <span>{p.series}</span>}
                    </>
                  )}
                </nav>
                <div className="flex flex-col gap-5">
                  {p.type && <Eyebrow>{p.type}</Eyebrow>}
                  <h1 className="type-number-m text-ink">{p.name}</h1>
                  {p.tagline && <p className="type-body-l text-subtle">{p.tagline}</p>}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button href="/contact" label="Talk to sales" variant="contrast" />
                    {downloads[0] && <Button href={downloads[0].url} label="Downloads" variant="secondary" />}
                  </div>
                </div>
                {keySpecs.length > 0 && (
                  <dl className="flex gap-10 border-t border-line-subtle pt-6">
                    {keySpecs.map((s) => (
                      <div key={s.label} className="flex flex-col gap-1">
                        <dt className="type-body-xs text-muted">{s.label}</dt>
                        <dd className="type-h5 text-ink">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              <div className="relative min-h-[28rem] max-lg:order-1 max-lg:aspect-[4/3] max-lg:min-h-0">
                {p.render?.url ? (
                  <Img media={p.render} eager alt={p.render.alt || p.name} className="absolute inset-0 size-full object-cover" />
                ) : (
                  <>
                    <StudioBackdrop tone="warm" className="absolute inset-0" />
                    {p.cutout?.url && (
                      <div className="absolute inset-x-[14%] top-[14%] bottom-[20%]">
                        <ProductShadow className="absolute inset-x-[10%] -bottom-[5%] h-[10%]" />
                        <Img media={p.cutout} eager alt={p.cutout.alt || p.name} className="relative size-full object-contain" />
                      </div>
                    )}
                  </>
                )}
                <div className="absolute inset-y-0 left-0 w-40 bg-linear-to-r from-raised to-transparent max-lg:hidden" />
              </div>
            </div>
          </div>
        </section>

        {/* Overview + features */}
        {(p.overview || features.length > 0) && (
          <section className="bg-page">
            <div className="site-container grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-16 px-margin py-section max-lg:grid-cols-1 max-lg:gap-10">
              <div className="flex flex-col gap-5">
                <Eyebrow>Overview</Eyebrow>
                {p.overview && <p className="type-h5 text-ink">{p.overview}</p>}
              </div>
              {features.length > 0 && (
                <ul className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
                  {features.map((f, i) => (
                    <li key={i} className="flex flex-col gap-3 rounded-md border border-line-subtle bg-white/[0.03] p-6">
                      <span className="type-body-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="type-h6 text-ink">{f.title}</h3>
                      {f.text && <p className="type-body-s text-subtle">{f.text}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* Specs + downloads */}
        {(specs.length > 0 || downloads.length > 0) && (
          <section className="bg-white text-black">
            <div className="site-container grid grid-cols-2 gap-16 px-margin py-section max-lg:grid-cols-1 max-lg:gap-12">
              {specs.length > 0 && (
                <div className="flex flex-col gap-8">
                  <SectionHeader eyebrow="Specifications" title="Key specs" size="h2" tone="light" layout="stacked" />
                  <dl className="flex flex-col">
                    {specs.map((s, i) => (
                      <div key={i} className="flex justify-between gap-6 border-t border-black/10 py-4 last:border-b">
                        <dt className="type-body-m text-secondary">{s.label}</dt>
                        <dd className="text-right type-body-m text-black">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="type-body-xs text-secondary">Full measurements are in the spec sheet.</p>
                </div>
              )}
              {downloads.length > 0 && (
                <div id="downloads" className="flex scroll-mt-4 flex-col gap-8">
                  <SectionHeader eyebrow="Documentation" title="Downloads" size="h2" tone="light" layout="stacked" />
                  <ul className="flex flex-col gap-3">
                    {downloads.map((d, i) => (
                      <li key={i}>
                        <a href={d.url || "/support/downloads"} className="group flex items-center justify-between gap-4 rounded-md border border-black/10 px-5 py-4 transition-colors hover:bg-black/[0.03]">
                          <span className="flex flex-col">
                            <span className="type-body-m text-black">{d.label}</span>
                            {d.meta && <span className="type-body-xs text-secondary">{d.meta}</span>}
                          </span>
                          <span aria-hidden className="type-body-m text-gold transition-transform group-hover:translate-x-1">→</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* More from the series */}
        {related.length > 0 && (
          <section className="bg-page">
            <div className="site-container flex flex-col gap-12 px-margin py-section max-lg:gap-8">
              <SectionHeader
                eyebrow={p.series}
                title={`More from the ${p.series}`}
                size="h2"
                action={p.seriesUrl ? <ArrowLink href={p.seriesUrl} label={`All ${p.series} models`} /> : undefined}
              />
              <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-3">
                {related.map((r) => (
                  <ModelCard key={r.id} product={r} />
                ))}
              </div>
            </div>
          </section>
        )}

        {connect.length > 0 && <Blocks blocks={connect} extras={{}} />}
      </main>
      <Footer settings={settings} />
    </>
  );
}
