import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/site/Shell";
import Button from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeader";
import { getDocument, getDocuments } from "@/lib/wp";
import Link from "next/link";

// Document page TEMPLATE (sitemap: "one page per file, so each manual can be
// found in search"). Content: WordPress → Documents. Related files are the
// other documents for the same product.

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getDocument((await params).slug);
  return doc ? { title: `${doc.title} · Adamson`, description: doc.summary } : { title: "Document · Adamson" };
}

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getDocument(slug);
  if (!doc) notFound();
  const related = (await getDocuments().catch(() => [])).filter((d) => d.product === doc.product && d.id !== doc.id).slice(0, 6);
  const facts: [string, string][] = [
    ["Product", doc.product],
    ["Series", doc.series],
    ["File type", doc.fileType],
    ["Language", doc.language],
    ["Version", doc.version],
    ["File size", doc.size],
    ["Updated", doc.updated],
  ].filter((f): f is [string, string] => Boolean(f[1]));

  return (
    <Shell>
      <section className="bg-page text-ink">
        <div className="site-container grid gap-16 px-margin py-section lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] max-lg:gap-10">
          <div className="flex min-w-0 flex-col gap-6">
            <nav aria-label="Breadcrumb" className="type-body-xs text-muted">
              <Link href="/support" className="hover:text-ink">Support</Link> / <Link href="/support/downloads" className="hover:text-ink">Documentation &amp; Downloads</Link>
            </nav>
            <Eyebrow>{doc.fileType}</Eyebrow>
            <h1 className="type-h2">{doc.title}</h1>
            {doc.discontinued && (
              <p className="self-start rounded-full border border-line px-3 py-1.5 type-tag text-subtle">Discontinued product</p>
            )}
            {doc.summary && <p className="max-w-[36rem] type-body-l text-subtle">{doc.summary}</p>}
            <div className="mt-2 flex flex-wrap gap-3">
              {doc.file && <Button href={doc.file} label={`Download${doc.size ? ` (${doc.size})` : ""}`} variant="primary" size="m" />}
              <Button href="/support/downloads" label="Back to library" variant="secondary" size="m" />
            </div>
          </div>
          <dl className="grid self-start rounded-lg border border-line-subtle bg-raised/60 p-8 max-md:p-6">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-line-subtle py-3 last:border-b-0">
                <dt className="type-body-s text-muted">{k}</dt>
                <dd className="type-body-s text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      {related.length > 0 && (
        <section className="bg-white text-black">
          <div className="site-container flex flex-col gap-8 px-margin py-section">
            <h2 className="type-h4">More for {doc.product}</h2>
            <ul className="flex flex-col border-t border-black/10">
              {related.map((d) => (
                <li key={d.id} className="group relative flex items-center justify-between gap-6 border-b border-black/10 py-5">
                  <div className="flex min-w-0 flex-col gap-1">
                    <a href={`/support/downloads/${d.slug}`} className="type-h6 after:absolute after:inset-0 group-hover:text-gold">{d.title}</a>
                    <span className="type-body-xs text-secondary">{[d.fileType, d.language, d.size].filter(Boolean).join(" · ")}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </Shell>
  );
}

export const instant = false;
