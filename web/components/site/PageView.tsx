import { cookies, draftMode } from "next/headers";
import { notFound } from "next/navigation";
import Blocks from "@/components/blocks/Blocks";
import { registry, type BlockNeed } from "@/components/blocks/registry";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getBlockExtras, getPage, getSettings } from "@/lib/wp";
import { PREVIEW_COOKIE } from "@/lib/preview";

/**
 * A WordPress page rendered from its blocks, with the global header and footer.
 * In draft mode the page being previewed (cookie) replaces the published one,
 * but only on its own path.
 */
export default async function PageView({ slug }: { slug: string }) {
  const { isEnabled: draft } = await draftMode();
  const previewId = draft ? Number((await cookies()).get(PREVIEW_COOKIE)?.value) : 0;
  const path = slug === "home" ? "/" : `/${slug}`;

  const [preview, settings] = await Promise.all([
    previewId ? getPage({ id: previewId, draft: true }).catch(() => null) : null,
    getSettings().catch(() => ({})),
  ]);
  const isPreview = Boolean(preview && (preview.path ?? (preview.slug === "home" ? "/" : `/${preview.slug}`)) === path);
  const page = isPreview ? preview : await getPage({ path: slug }).catch(() => null);
  if (!page) notFound();

  const needs = new Set<BlockNeed>(page.blocks.flatMap((b) => registry[b.name]?.needs ?? []));
  const extras = await getBlockExtras(needs);

  return (
    <>
      {isPreview && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-gold px-4 py-2 type-body-xs text-white shadow-lg">
          Draft preview: {page.title} ({page.status})
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API route needs a full request */}
          <a href="/api/exit-preview" className="underline">Exit</a>
        </div>
      )}
      <Header settings={settings} />
      <main>
        <Blocks blocks={page.blocks} extras={extras} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
