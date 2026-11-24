// One homepage block (or the header/footer) on its own page, for the style guide previews.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Blocks from "@/components/blocks/Blocks";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { registry, type BlockNeed } from "@/components/blocks/registry";
import { getBlockExtras, getPage, getSettings } from "@/lib/wp";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Pre-built: the header, the footer and up to 30 section slots (empty slots 404).
export function generateStaticParams() {
  return ["header", "footer", ...Array.from({ length: 30 }, (_, i) => String(i))].map((index) => ({ index }));
}

export default async function BlockPage({ params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  if (index === "header" || index === "footer") {
    const settings = await getSettings().catch(() => ({}));
    return index === "header" ? <Header settings={settings} /> : <Footer settings={settings} />;
  }
  const page = await getPage({ slug: "home" }).catch(() => null);
  const block = page?.blocks[Number(index)];
  if (!block) notFound();
  const extras = await getBlockExtras(new Set<BlockNeed>(registry[block.name]?.needs ?? []));
  return <Blocks blocks={[block]} extras={extras} />;
}

export const instant = false;
