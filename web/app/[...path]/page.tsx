import type { Metadata } from "next";
import PageView from "@/components/site/PageView";
import { getPage } from "@/lib/wp";

// Any WordPress page by its path (/technology, /company/history …). Pages are
// built from blocks, so a new page in WordPress appears here with no code.
type Props = { params: Promise<{ path: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const page = await getPage({ path: path.join("/") }).catch(() => null);
  return { title: page ? `${page.title} · Adamson` : "Adamson" };
}

export default async function Page({ params }: Props) {
  const { path } = await params;
  return <PageView slug={path.map(decodeURIComponent).join("/")} />;
}

export const instant = false;
